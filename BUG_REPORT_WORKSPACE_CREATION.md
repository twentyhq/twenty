# Bug Report: Workspace Creation Failure

## Summary
When attempting to create a new workspace via the `signUpInNewWorkspace` mutation, the workspace is created in a `PENDING_CREATION` state but never properly activated, leading to errors when the system tries to execute GraphQL queries on the incomplete workspace.

## Error Details

### Symptoms
- User attempts to create a new workspace
- Workspace is created with `activationStatus: PENDING_CREATION`
- User is issued a login token and redirected to verify page
- System queries fail because workspace metadata and workspace members are not initialized
- User gets stuck in an incomplete onboarding flow

### Example Query Log
```
query: SELECT "KeyValuePair"... WHERE "type" = 'CONFIG_VARIABLE'
query: SELECT "Workspace"... WHERE "id" = '3b8e6458-5fc1-4e63-8563-008ccddaa6db'
query: SELECT "User"... WHERE "id" = '20202020-9e3b...'
query: SELECT "UserWorkspace"... WHERE "id" = '20202020-e10a-4c27-a90b-b08c57b02d44'
[GQL Execute] Processing GQL query SignUpInNewWorkspace on workspace 3b8e6458-5fc1-4e63-8563-008ccddaa6db
query: SELECT COUNT(1) AS "cnt" FROM "core"."workspace"
```

The system attempts to process GraphQL queries on a workspace that hasn't been fully initialized.

## Root Cause Analysis

### Current Workspace Creation Flow

1. **User calls `signUpInNewWorkspace` mutation** (`auth.resolver.ts:487-491`)
   - Resolver calls `signInUpService.signUpOnNewWorkspace()`
   - Method: `packages/twenty-server/src/engine/core-modules/auth/services/sign-in-up.service.ts:356-434`

2. **Workspace is created with `PENDING_CREATION` status** (line 397-404)
   ```typescript
   const workspaceToCreate = this.workspaceRepository.create({
     subdomain: await this.domainManagerService.generateSubdomain(...),
     displayName: '',
     inviteHash: v4(),
     activationStatus: WorkspaceActivationStatus.PENDING_CREATION, // ⚠️ Not active!
     logo,
   });
   ```

3. **UserWorkspace is created** (line 415-421)
   ```typescript
   await this.userWorkspaceService.create({
     userId: user.id,
     workspaceId: workspace.id,
     isExistingUser,
     pictureUrl: ...
   });
   ```
   - This only creates the `UserWorkspace` record
   - Does NOT create the `WorkspaceMember` record (critical!)
   - Does NOT initialize workspace metadata schema

4. **Onboarding flags are set** (line 423-428)
   ```typescript
   await this.activateOnboardingForUser(user, workspace);
   await this.onboardingService.setOnboardingInviteTeamPending({...});
   ```

5. **Login token is returned**
   - User is expected to be redirected to the "Create Workspace" page
   - User should enter workspace display name
   - System should call `activateWorkspace` mutation

### The Problem

**The workspace is never activated**, meaning:

1. ❌ **No WorkspaceMember record is created**
   - `WorkspaceMember` is only created in `activateWorkspace` → `createWorkspaceMember`
   - Location: `packages/twenty-server/src/engine/core-modules/workspace/services/workspace.service.ts:250-296`

2. ❌ **Workspace metadata is not initialized**
   - `workspaceManagerService.init()` is only called in `activateWorkspace`
   - This initializes the workspace-specific database schema and metadata

3. ❌ **Workspace remains in `PENDING_CREATION` state**
   - The onboarding status becomes `WORKSPACE_ACTIVATION` (see `onboarding.service.ts:36-39`)
   - User should be redirected to `/create/workspace` page
   - But something in the redirect/authentication flow is failing

4. ❌ **Default role is not assigned**
   - Workspace constraint requires `defaultRoleId` to be set when not in `PENDING_CREATION` or `ONGOING_CREATION`
   - Migration: `1742998832316-addWorkspaceConstraint.ts`

### Expected Activation Flow

The `activateWorkspace` method should:

```typescript
async activateWorkspace(user: User, workspace: Workspace, data: ActivateWorkspaceInput) {
  // 1. Set status to ONGOING_CREATION
  await this.workspaceRepository.update(workspace.id, {
    activationStatus: WorkspaceActivationStatus.ONGOING_CREATION,
  });

  // 2. Enable feature flags
  await this.featureFlagService.enableFeatureFlags(DEFAULT_FEATURE_FLAGS, workspace.id);

  // 3. Initialize workspace metadata schema ⚠️ CRITICAL
  await this.workspaceManagerService.init({
    workspaceId: workspace.id,
    userId: user.id,
  });

  // 4. Create WorkspaceMember record ⚠️ CRITICAL
  await this.userWorkspaceService.createWorkspaceMember(workspace.id, user);

  // 5. Set status to ACTIVE and set display name
  await this.workspaceRepository.update(workspace.id, {
    displayName: data.displayName,
    activationStatus: WorkspaceActivationStatus.ACTIVE,
    version: extractVersionMajorMinorPatch(appVersion),
  });
}
```

## Impact

### High Severity
- **Broken user experience**: Users cannot create new workspaces
- **Data inconsistency**: Workspaces exist in database but are unusable
- **Authentication issues**: Users receive login tokens but cannot access workspace

## Possible Causes

1. **Redirect flow broken**: After `signUpInNewWorkspace`, user should be redirected to workspace subdomain with login token to `/create/workspace` page, but redirect may be failing

2. **Frontend not calling activation**: The CreateWorkspace page (`packages/twenty-front/src/pages/onboarding/CreateWorkspace.tsx`) should call `activateWorkspace` mutation, but it may not be reached

3. **Authentication token issue**: Login token may not be working correctly for cross-domain redirect

4. **Missing onboarding status check**: System may be trying to execute workspace queries before checking onboarding status

## Fix Plan

### Option 1: Immediate Activation (Recommended for Quick Fix)
**Automatically activate workspace in `signUpOnNewWorkspace`**

**Location**: `packages/twenty-server/src/engine/core-modules/auth/services/sign-in-up.service.ts`

```typescript
async signUpOnNewWorkspace(userData: ExistingUserOrPartialUserWithPicture['userData']) {
  // ... existing workspace creation code ...

  const workspace = await this.workspaceRepository.save(workspaceToCreate);
  
  // ... existing user creation code ...

  // ✅ ADD: Immediately activate the workspace
  const activatedWorkspace = await this.workspaceService.activateWorkspace(
    user,
    workspace,
    { displayName: '' } // Can be updated later
  );

  // Remove onboarding flags since workspace is already active
  // await this.activateOnboardingForUser(user, workspace); // Remove or adjust
  
  return { user, workspace: activatedWorkspace };
}
```

**Pros**: 
- Quick fix
- Users can immediately use workspace
- No complex redirect flow needed

**Cons**:
- Workspace starts with empty display name
- Skips the "name your workspace" onboarding step
- May need UI adjustment to allow naming workspace after creation

### Option 2: Fix Redirect Flow (Proper Long-term Fix)
**Ensure proper redirect to CreateWorkspace page**

**Changes needed**:

1. **Verify login token generation** (`auth.resolver.ts`)
   - Ensure login token is valid and has correct permissions

2. **Fix domain redirect** (`useSignUpInNewWorkspace.ts`)
   - Verify `redirectToWorkspaceDomain` correctly redirects to workspace subdomain
   - Ensure login token is passed correctly

3. **Add error handling** in frontend
   - Better error messages if activation fails
   - Retry mechanism

4. **Workspace guard on queries**
   - Add middleware to check workspace activation status before processing queries
   - Return friendly error if workspace not active

### Option 3: Hybrid Approach (Best Solution)
**Partially initialize workspace, defer naming**

```typescript
async signUpOnNewWorkspace(userData: ...) {
  // Create workspace with ONGOING_CREATION status
  const workspaceToCreate = this.workspaceRepository.create({
    activationStatus: WorkspaceActivationStatus.ONGOING_CREATION, // Changed
    displayName: '', // Empty initially
    // ... other fields
  });

  const workspace = await this.workspaceRepository.save(workspaceToCreate);
  
  // ... create user ...

  // ✅ Initialize critical workspace components immediately
  await this.featureFlagService.enableFeatureFlags(DEFAULT_FEATURE_FLAGS, workspace.id);
  await this.workspaceManagerService.init({
    workspaceId: workspace.id,
    userId: user.id,
  });
  await this.userWorkspaceService.createWorkspaceMember(workspace.id, user);

  // ✅ Set to ACTIVE immediately - workspace is functional
  await this.workspaceRepository.update(workspace.id, {
    activationStatus: WorkspaceActivationStatus.ACTIVE,
  });

  // Set onboarding to allow user to customize later
  await this.activateOnboardingForUser(user, workspace);
  
  return { user, workspace };
}
```

Then add a "Customize Workspace" step in onboarding that's optional.

## Testing Plan

1. **Test workspace creation flow**
   - Create new user
   - Call `signUpInNewWorkspace`
   - Verify workspace is created with correct status
   - Verify WorkspaceMember is created
   - Verify workspace metadata is initialized

2. **Test redirect flow**
   - Verify login token works
   - Verify user reaches correct page
   - Verify no errors in console

3. **Test GraphQL queries**
   - Verify queries work on newly created workspace
   - Verify user can access workspace data

4. **Test database constraints**
   - Verify `defaultRoleId` is set when workspace becomes ACTIVE
   - Verify no constraint violations

## Related Files

### Backend
- `packages/twenty-server/src/engine/core-modules/auth/auth.resolver.ts:487-520`
- `packages/twenty-server/src/engine/core-modules/auth/services/sign-in-up.service.ts:356-434`
- `packages/twenty-server/src/engine/core-modules/workspace/services/workspace.service.ts:250-296`
- `packages/twenty-server/src/engine/core-modules/onboarding/onboarding.service.ts:36-54`
- `packages/twenty-server/src/engine/core-modules/user-workspace/user-workspace.service.ts:57-83`

### Frontend
- `packages/twenty-front/src/modules/auth/sign-in-up/hooks/useSignUpInNewWorkspace.ts`
- `packages/twenty-front/src/pages/onboarding/CreateWorkspace.tsx`
- `packages/twenty-front/src/hooks/usePageChangeEffectNavigateLocation.ts`

### Database
- `packages/twenty-server/src/database/typeorm/core/migrations/common/1742998832316-addWorkspaceConstraint.ts`

## Recommendation

**Implement Option 3 (Hybrid Approach)** because:

1. ✅ Workspace becomes immediately functional
2. ✅ No complex redirect debugging needed
3. ✅ User can still customize workspace name later
4. ✅ Maintains data integrity
5. ✅ Better user experience - no stuck states
6. ✅ Easier to implement than fixing redirect flow
7. ✅ More resilient to network/redirect issues

The key insight is that **workspace activation should not depend on user interaction**. The workspace should be fully functional immediately after creation, with cosmetic customization (like naming) happening later in a non-blocking way.