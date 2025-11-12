# Fix Implementation Plan: Workspace Creation Issue

## Executive Summary

**Issue**: Workspaces created via `signUpInNewWorkspace` remain in `PENDING_CREATION` state, causing initialization failures and blocking user access.

**Root Cause**: The workspace activation flow depends on a multi-step user interaction (redirect → login → name workspace → activate), but failures in this chain leave workspaces in an unusable state.

**Solution**: Initialize workspace immediately upon creation, making it fully functional without requiring user interaction to complete activation.

**Estimated Implementation Time**: 2-4 hours
**Risk Level**: Low-Medium
**Impact**: High (fixes broken workspace creation)

---

## Implementation Strategy

### Approach: Immediate Workspace Initialization

Instead of creating a workspace in `PENDING_CREATION` state and waiting for user action, we will:

1. Create workspace with `ONGOING_CREATION` status
2. Immediately initialize all critical components (metadata, workspace member, feature flags)
3. Set workspace to `ACTIVE` status
4. Allow optional workspace customization in onboarding

This eliminates dependency on redirect flow and provides a resilient, fault-tolerant creation process.

---

## Detailed Implementation Steps

### Phase 1: Backend Changes

#### Step 1.1: Modify `signUpOnNewWorkspace` Method

**File**: `packages/twenty-server/src/engine/core-modules/auth/services/sign-in-up.service.ts`

**Location**: Lines 356-434

**Changes**:

```typescript
async signUpOnNewWorkspace(
  userData: ExistingUserOrPartialUserWithPicture['userData'],
) {
  const email =
    userData.type === 'newUserWithPicture'
      ? userData.newUserWithPicture.email
      : userData.existingUser.email;

  if (!email) {
    throw new AuthException(
      'Email is required',
      AuthExceptionCode.INVALID_INPUT,
      {
        userFriendlyMessage: t`Email is required`,
      },
    );
  }

  const { canImpersonate, canAccessFullAdminPanel } =
    await this.setDefaultImpersonateAndAccessFullAdminPanel();

  const logoUrl = `${TWENTY_ICONS_BASE_URL}/${getDomainNameByEmail(email)}`;
  const isLogoUrlValid = async () => {
    try {
      return (
        (await this.httpService.axiosRef.get(logoUrl, { timeout: 600 }))
          .status === 200
      );
    } catch {
      return false;
    }
  };

  const isWorkEmailFound = isWorkEmail(email);
  const logo =
    isWorkEmailFound && (await isLogoUrlValid()) ? logoUrl : undefined;

  // ✅ CHANGE: Create workspace with ONGOING_CREATION status
  const workspaceToCreate = this.workspaceRepository.create({
    subdomain: await this.domainManagerService.generateSubdomain(
      isWorkEmailFound ? { email } : {},
    ),
    displayName: '', // Will be empty initially - can be set later
    inviteHash: v4(),
    activationStatus: WorkspaceActivationStatus.ONGOING_CREATION, // Changed from PENDING_CREATION
    logo,
  });

  const workspace = await this.workspaceRepository.save(workspaceToCreate);

  const isExistingUser = userData.type === 'existingUser';
  const user = isExistingUser
    ? userData.existingUser
    : await this.saveNewUser(userData.newUserWithPicture, {
        canImpersonate,
        canAccessFullAdminPanel,
      });

  // ✅ CHANGE: Create UserWorkspace first
  await this.userWorkspaceService.create({
    userId: user.id,
    workspaceId: workspace.id,
    isExistingUser,
    pictureUrl: isExistingUser
      ? undefined
      : userData.newUserWithPicture.picture,
  });

  // ✅ NEW: Initialize workspace immediately
  try {
    // Enable feature flags
    await this.featureFlagService.enableFeatureFlags(
      DEFAULT_FEATURE_FLAGS,
      workspace.id,
    );

    // Initialize workspace metadata schema
    await this.workspaceManagerService.init({
      workspaceId: workspace.id,
      userId: user.id,
    });

    // Create workspace member
    await this.userWorkspaceService.createWorkspaceMember(workspace.id, user);

    // Get app version
    const appVersion = this.twentyConfigService.get('APP_VERSION');

    // ✅ NEW: Set workspace to ACTIVE immediately
    await this.workspaceRepository.update(workspace.id, {
      activationStatus: WorkspaceActivationStatus.ACTIVE,
      version: extractVersionMajorMinorPatch(appVersion),
    });

    // Reload workspace with updated status
    const activatedWorkspace = await this.workspaceRepository.findOneBy({
      id: workspace.id,
    });

    // ✅ CHANGE: Set onboarding for profile/email sync, but NOT workspace activation
    // User can optionally update workspace name later
    await this.activateOnboardingForUser(user, activatedWorkspace);

    // ✅ REMOVE: Don't set invite team as pending during creation
    // User will get to this step naturally in onboarding flow
    // await this.onboardingService.setOnboardingInviteTeamPending({...});

    return { user, workspace: activatedWorkspace };
  } catch (error) {
    // ✅ NEW: Rollback on failure
    // Clean up workspace if initialization fails
    await this.workspaceRepository.delete(workspace.id);
    await this.userWorkspaceRepository.delete({ workspaceId: workspace.id });
    
    throw new AuthException(
      'Failed to initialize workspace',
      AuthExceptionCode.INTERNAL_SERVER_ERROR,
      {
        userFriendlyMessage: t`Failed to create workspace. Please try again.`,
        originalError: error,
      },
    );
  }
}
```

**Key Changes**:
1. Workspace starts with `ONGOING_CREATION` instead of `PENDING_CREATION`
2. Immediately call workspace initialization steps
3. Set workspace to `ACTIVE` after successful initialization
4. Add error handling and rollback logic
5. Remove `setOnboardingInviteTeamPending` call (not needed immediately)

#### Step 1.2: Add Required Imports

**File**: Same file as above

**Add to imports section** (around line 1-40):

```typescript
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { extractVersionMajorMinorPatch } from 'src/engine/core-modules/workspace/utils/extract-version-major-minor-patch';
import { DEFAULT_FEATURE_FLAGS } from 'src/engine/core-modules/feature-flag/feature-flag.constants';
```

Verify these imports exist, if not, find the correct import paths.

#### Step 1.3: Add Dependency Injections

**File**: Same file

**Check constructor** (around line 50-100) includes:

```typescript
constructor(
  // ... existing dependencies ...
  private readonly featureFlagService: FeatureFlagService,
  private readonly workspaceManagerService: WorkspaceManagerService,
  private readonly twentyConfigService: TwentyConfigService,
  // ... rest of dependencies ...
)
```

If these are missing, add them to the constructor and to the module's providers.

#### Step 1.4: Update Onboarding Logic (Optional Enhancement)

**File**: `packages/twenty-server/src/engine/core-modules/onboarding/onboarding.service.ts`

**Location**: Lines 40-54 (getOnboardingStatus method)

**Optional Change** - Skip workspace activation check since all workspaces will be active:

```typescript
async getOnboardingStatus(user: User, workspace: Workspace) {
  if (
    await this.billingService.isSubscriptionIncompleteOnboardingStatus(
      workspace.id,
    )
  ) {
    return OnboardingStatus.PLAN_REQUIRED;
  }

  // ✅ CHANGE: Remove workspace activation check
  // Workspaces are now always activated immediately
  // if (this.isWorkspaceActivationPending(workspace)) {
  //   return OnboardingStatus.WORKSPACE_ACTIVATION;
  // }

  const userVars = await this.userVarsService.getAll({
    userId: user.id,
    workspaceId: workspace.id,
  });

  // ... rest of method unchanged ...
}
```

**Note**: This change is optional but recommended. It removes the `WORKSPACE_ACTIVATION` onboarding status since workspaces are always activated.

---

### Phase 2: Frontend Changes (Optional)

Since workspaces are now automatically activated, the frontend changes are mostly cleanup:

#### Step 2.1: Update CreateWorkspace Page (Optional)

**File**: `packages/twenty-front/src/pages/onboarding/CreateWorkspace.tsx`

**Option A**: Keep the page for workspace naming
- Change from "Create Workspace" to "Name Your Workspace"
- Instead of calling `activateWorkspace`, call an `updateWorkspace` mutation
- Make this step optional (add "Skip" button)

**Option B**: Redirect past this page
- Since workspace is already active, redirect to next onboarding step
- Remove the page from onboarding flow

**Recommendation**: Keep Option A for better UX - users should name their workspace

---

### Phase 3: Database Migration (If Needed)

#### Step 3.1: Check Existing Workspaces

Run this query to check for stuck workspaces:

```sql
SELECT 
  id, 
  "displayName", 
  "activationStatus", 
  "createdAt"
FROM core.workspace
WHERE "activationStatus" = 'PENDING_CREATION'
AND "createdAt" > NOW() - INTERVAL '7 days';
```

#### Step 3.2: Create Migration for Stuck Workspaces

**File**: `packages/twenty-server/src/database/typeorm/core/migrations/common/[TIMESTAMP]-fix-pending-workspaces.ts`

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixPendingWorkspaces[TIMESTAMP] implements MigrationInterface {
  name = 'FixPendingWorkspaces[TIMESTAMP]';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Delete workspaces that are stuck in PENDING_CREATION for > 24 hours
    // These are likely broken and should be cleaned up
    await queryRunner.query(`
      DELETE FROM "core"."userWorkspace"
      WHERE "workspaceId" IN (
        SELECT id FROM "core"."workspace"
        WHERE "activationStatus" = 'PENDING_CREATION'
        AND "createdAt" < NOW() - INTERVAL '24 hours'
      );
    `);

    await queryRunner.query(`
      DELETE FROM "core"."workspace"
      WHERE "activationStatus" = 'PENDING_CREATION'
      AND "createdAt" < NOW() - INTERVAL '24 hours';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cannot restore deleted workspaces
  }
}
```

---

## Testing Plan

### Unit Tests

#### Test 1: Successful Workspace Creation

```typescript
describe('signUpOnNewWorkspace', () => {
  it('should create and activate workspace immediately', async () => {
    const result = await signInUpService.signUpOnNewWorkspace({
      type: 'newUserWithPicture',
      newUserWithPicture: {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        picture: null,
      },
    });

    expect(result.workspace.activationStatus).toBe(WorkspaceActivationStatus.ACTIVE);
    expect(result.workspace.id).toBeDefined();
    
    // Verify workspace member was created
    const workspaceMember = await workspaceMemberRepository.findOne({
      where: { userId: result.user.id },
    });
    expect(workspaceMember).toBeDefined();
  });
});
```

#### Test 2: Workspace Rollback on Failure

```typescript
it('should rollback workspace creation on initialization failure', async () => {
  // Mock workspace manager to throw error
  jest.spyOn(workspaceManagerService, 'init').mockRejectedValue(
    new Error('Initialization failed')
  );

  await expect(
    signInUpService.signUpOnNewWorkspace({
      type: 'newUserWithPicture',
      newUserWithPicture: {
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        picture: null,
      },
    })
  ).rejects.toThrow('Failed to initialize workspace');

  // Verify workspace was deleted
  const workspaces = await workspaceRepository.find();
  expect(workspaces.length).toBe(0);
});
```

### Integration Tests

#### Test 3: End-to-End Workspace Creation

```typescript
it('should create workspace and allow GraphQL queries immediately', async () => {
  // 1. Create workspace
  const result = await signUpInNewWorkspace();
  
  // 2. Verify workspace is active
  expect(result.workspace.activationStatus).toBe('ACTIVE');
  
  // 3. Execute GraphQL query on workspace
  const response = await graphqlRequest({
    query: GET_CURRENT_USER,
    workspaceId: result.workspace.id,
    userId: result.user.id,
  });
  
  // 4. Verify query succeeds
  expect(response.data.currentUser).toBeDefined();
  expect(response.errors).toBeUndefined();
});
```

### Manual Testing

1. **Happy Path**:
   - Clear database
   - Sign up new user
   - Verify workspace is created
   - Verify redirect works
   - Verify user can access workspace immediately

2. **Existing User**:
   - Sign in with existing user
   - Create new workspace
   - Verify workspace is functional
   - Verify user has access to both workspaces

3. **Error Handling**:
   - Simulate database error during creation
   - Verify workspace is not left in broken state
   - Verify user sees appropriate error message

---

## Rollback Plan

### If Issues Occur

1. **Revert Code Changes**:
   ```bash
   git revert <commit-hash>
   git push origin main
   ```

2. **Database Cleanup** (if needed):
   ```sql
   -- Find workspaces created during problematic deployment
   SELECT * FROM core.workspace
   WHERE "createdAt" > '2024-01-XX HH:MM:SS'
   AND "activationStatus" = 'ONGOING_CREATION';
   
   -- Delete if necessary
   DELETE FROM core."userWorkspace"
   WHERE "workspaceId" IN (SELECT id FROM core.workspace WHERE ...);
   
   DELETE FROM core.workspace WHERE ...;
   ```

3. **Redeploy Previous Version**:
   - Roll back container to previous image
   - Verify service health

### Rollback Trigger Criteria

Rollback immediately if:
- Workspace creation failure rate > 5%
- Database constraint violations occur
- GraphQL query errors increase significantly
- User reports of inaccessible workspaces

---

## Deployment Plan

### Pre-Deployment Checklist

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Code review completed
- [ ] Database backup created
- [ ] Monitoring alerts configured
- [ ] Rollback plan reviewed

### Deployment Steps

1. **Stage 1: Deploy to Staging**
   - Deploy changes to staging environment
   - Run full test suite
   - Create test workspaces manually
   - Verify functionality

2. **Stage 2: Database Migration**
   - Run migration to clean up stuck workspaces
   - Verify migration success
   - Check no active workspaces affected

3. **Stage 3: Deploy to Production**
   - Deploy during low-traffic window
   - Monitor error rates
   - Monitor workspace creation metrics

4. **Stage 4: Post-Deployment Verification**
   - Create test workspace
   - Verify GraphQL queries work
   - Check monitoring dashboards
   - Review logs for errors

### Monitoring

Watch these metrics for 24 hours post-deployment:

1. **Workspace Creation Rate**
   - Should remain stable or increase
   - Alert if drops > 20%

2. **Workspace Creation Errors**
   - Should be near 0%
   - Alert if > 2%

3. **GraphQL Query Errors on New Workspaces**
   - Should be 0
   - Alert on any occurrence

4. **Database Constraint Violations**
   - Should be 0
   - Alert immediately

---

## Success Criteria

### Must Have
- ✅ Workspaces created successfully with ACTIVE status
- ✅ WorkspaceMember records created automatically
- ✅ GraphQL queries work immediately after creation
- ✅ No workspace creation errors
- ✅ No database constraint violations

### Nice to Have
- ✅ Improved error messages
- ✅ Workspace creation metrics dashboard
- ✅ Reduced onboarding friction
- ✅ Optional workspace customization

---

## Post-Implementation Tasks

1. **Documentation Update**
   - Update API documentation
   - Update onboarding flow diagrams
   - Document new error handling

2. **Monitoring Setup**
   - Add workspace creation success rate metric
   - Add workspace activation status distribution metric
   - Set up alerts for failures

3. **Cleanup**
   - Remove unused `WORKSPACE_ACTIVATION` onboarding status (after verification)
   - Remove `activateWorkspace` mutation (if no longer needed)
   - Clean up frontend CreateWorkspace page (update purpose)

4. **Future Improvements**
   - Add workspace templates
   - Add workspace cloning
   - Improve workspace name validation
   - Add workspace avatar customization

---

## Risk Assessment

### Low Risk
- ✅ Changes are isolated to workspace creation flow
- ✅ Existing workspaces unaffected
- ✅ Rollback is straightforward
- ✅ Well-tested code path (uses existing `activateWorkspace` logic)

### Medium Risk
- ⚠️ Database transaction spans multiple operations
- ⚠️ Potential for partial creation on error
- **Mitigation**: Added rollback logic in catch block

### High Risk
- None identified

---

## Timeline

- **Day 1**: Implement backend changes + unit tests (4 hours)
- **Day 2**: Integration tests + staging deployment (3 hours)
- **Day 3**: Production deployment + monitoring (2 hours)
- **Total**: ~9 hours over 3 days

---

## Questions & Decisions

### Q1: Should we keep the CreateWorkspace page?
**Decision**: Yes, repurpose it for workspace naming/customization
**Rationale**: Good UX to let users name their workspace, but make it optional

### Q2: Should we remove WORKSPACE_ACTIVATION onboarding status?
**Decision**: Yes, but in a follow-up PR
**Rationale**: Not critical for fix, can be cleaned up later

### Q3: What about workspaces stuck in PENDING_CREATION?
**Decision**: Clean up workspaces older than 24 hours in migration
**Rationale**: These are broken and likely abandoned

### Q4: Should workspace creation be atomic (all-or-nothing)?
**Decision**: Yes, with explicit rollback on error
**Rationale**: Better to fail cleanly than leave partial state

---

## Approval & Sign-off

- [ ] Engineering Lead
- [ ] Product Manager  
- [ ] QA Lead
- [ ] DevOps Lead

---

**Created**: [Date]
**Last Updated**: [Date]
**Status**: Draft
**Priority**: High
**Assigned To**: [Engineer Name]