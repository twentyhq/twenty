# Workspace Creation Fix - Exact Code Changes

## Overview
This document contains the exact code changes needed to fix the workspace creation bug where workspaces remain in `PENDING_CREATION` state.

---

## Change 1: Update SignInUpService - Add Import

**File**: `packages/twenty-server/src/engine/core-modules/auth/services/sign-in-up.service.ts`

**Location**: Around line 35 (imports section)

**Add this import**:
```typescript
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
```

**Complete imports section should look like**:
```typescript
import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-invitation/services/workspace-invitation.service';
import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service'; // ADD THIS LINE
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
```

---

## Change 2: Update SignInUpService - Inject WorkspaceService

**File**: Same as above

**Location**: Around line 45-60 (constructor)

**Current code**:
```typescript
constructor(
  @InjectRepository(User)
  private readonly userRepository: Repository<User>,
  @InjectRepository(Workspace)
  private readonly workspaceRepository: Repository<Workspace>,
  private readonly workspaceInvitationService: WorkspaceInvitationService,
  private readonly userWorkspaceService: UserWorkspaceService,
  private readonly onboardingService: OnboardingService,
  private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  private readonly httpService: HttpService,
  private readonly twentyConfigService: TwentyConfigService,
  private readonly domainManagerService: DomainManagerService,
  private readonly userService: UserService,
) {}
```

**New code** (add one line):
```typescript
constructor(
  @InjectRepository(User)
  private readonly userRepository: Repository<User>,
  @InjectRepository(Workspace)
  private readonly workspaceRepository: Repository<Workspace>,
  private readonly workspaceInvitationService: WorkspaceInvitationService,
  private readonly userWorkspaceService: UserWorkspaceService,
  private readonly onboardingService: OnboardingService,
  private readonly workspaceEventEmitter: WorkspaceEventEmitter,
  private readonly httpService: HttpService,
  private readonly twentyConfigService: TwentyConfigService,
  private readonly domainManagerService: DomainManagerService,
  private readonly userService: UserService,
  private readonly workspaceService: WorkspaceService, // ADD THIS LINE
) {}
```

---

## Change 3: Update signUpOnNewWorkspace Method

**File**: Same as above

**Location**: Lines 356-434 (entire `signUpOnNewWorkspace` method)

**Current code**:
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

  const workspaceToCreate = this.workspaceRepository.create({
    subdomain: await this.domainManagerService.generateSubdomain(
      isWorkEmailFound ? { email } : {},
    ),
    displayName: '',
    inviteHash: v4(),
    activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
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

  await this.userWorkspaceService.create({
    userId: user.id,
    workspaceId: workspace.id,
    isExistingUser,
    pictureUrl: isExistingUser
      ? undefined
      : userData.newUserWithPicture.picture,
  });

  await this.activateOnboardingForUser(user, workspace);

  await this.onboardingService.setOnboardingInviteTeamPending({
    workspaceId: workspace.id,
    value: true,
  });

  return { user, workspace };
}
```

**New code** (replace entire method):
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

  const workspaceToCreate = this.workspaceRepository.create({
    subdomain: await this.domainManagerService.generateSubdomain(
      isWorkEmailFound ? { email } : {},
    ),
    displayName: '',
    inviteHash: v4(),
    activationStatus: WorkspaceActivationStatus.PENDING_CREATION,
    logo,
  });

  let workspace = await this.workspaceRepository.save(workspaceToCreate);

  const isExistingUser = userData.type === 'existingUser';
  const user = isExistingUser
    ? userData.existingUser
    : await this.saveNewUser(userData.newUserWithPicture, {
        canImpersonate,
        canAccessFullAdminPanel,
      });

  await this.userWorkspaceService.create({
    userId: user.id,
    workspaceId: workspace.id,
    isExistingUser,
    pictureUrl: isExistingUser
      ? undefined
      : userData.newUserWithPicture.picture,
  });

  // NEW: Activate workspace immediately
  try {
    const displayName = user.firstName
      ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}'s Workspace`
      : 'My Workspace';

    workspace = await this.workspaceService.activateWorkspace(
      user,
      workspace,
      { displayName },
    );
  } catch (error) {
    // Rollback: Clean up workspace if activation fails
    try {
      await this.userWorkspaceService.deleteByWorkspaceId(workspace.id);
    } catch {
      // Ignore errors during cleanup
    }
    
    try {
      await this.workspaceRepository.delete(workspace.id);
    } catch {
      // Ignore errors during cleanup
    }

    throw new AuthException(
      'Failed to activate workspace',
      AuthExceptionCode.INTERNAL_SERVER_ERROR,
      {
        userFriendlyMessage: t`Failed to create workspace. Please try again.`,
        originalError: error,
      },
    );
  }

  await this.activateOnboardingForUser(user, workspace);

  // Removed: setOnboardingInviteTeamPending - not needed immediately
  // await this.onboardingService.setOnboardingInviteTeamPending({
  //   workspaceId: workspace.id,
  //   value: true,
  // });

  return { user, workspace };
}
```

**Key Changes Summary**:
1. Changed `const workspace` to `let workspace` (line 46)
2. Added try-catch block after userWorkspaceService.create (lines 63-94)
3. Call `workspaceService.activateWorkspace()` inside try block (lines 67-72)
4. Added rollback logic in catch block (lines 74-89)
5. Commented out `setOnboardingInviteTeamPending` call (lines 98-102)

---

## Change 4: Add Cleanup Method to UserWorkspaceService (Optional)

**File**: `packages/twenty-server/src/engine/core-modules/user-workspace/user-workspace.service.ts`

**Location**: End of class (around line 450), before the closing brace

**Add this method**:
```typescript
async deleteByWorkspaceId(workspaceId: string): Promise<void> {
  await this.userWorkspaceRepository.delete({ workspaceId });
}
```

**Note**: Check if this method already exists. If it does, skip this step.

---

## Verification Steps

After making changes, verify:

1. **TypeScript compiles without errors**:
```bash
yarn build
```

2. **No import errors**:
```bash
yarn lint
```

3. **Tests pass**:
```bash
yarn test
```

---

## Testing the Fix

### Manual Test

1. **Start the server**:
```bash
yarn start:server
```

2. **Call the mutation** (via GraphQL Playground):
```graphql
mutation {
  signUp(email: "test@example.com", password: "TestPassword123!") {
    availableWorkspaces {
      availableWorkspacesForSignIn {
        id
        displayName
      }
    }
    tokens {
      accessOrWorkspaceAgnosticToken {
        token
      }
    }
  }
}
```

Then:
```graphql
mutation {
  signUpInNewWorkspace {
    loginToken {
      token
      expiresAt
    }
    workspace {
      id
      workspaceUrls {
        subdomainUrl
      }
    }
  }
}
```

3. **Verify workspace status in database**:
```sql
SELECT 
  id, 
  "displayName", 
  "activationStatus", 
  subdomain,
  "createdAt"
FROM core.workspace 
ORDER BY "createdAt" DESC 
LIMIT 1;
```

Expected: `activationStatus` should be `'ACTIVE'`

4. **Verify workspace member was created**:
```sql
SELECT 
  wm.id,
  wm."userId",
  wm."userEmail",
  wm."name"
FROM metadata."workspaceMember" wm
JOIN core.workspace w ON w.id::text = wm."workspaceId"
ORDER BY w."createdAt" DESC
LIMIT 1;
```

Expected: Should return one row with the user's information

---

## Diff Format (Git-style)

```diff
diff --git a/packages/twenty-server/src/engine/core-modules/auth/services/sign-in-up.service.ts b/packages/twenty-server/src/engine/core-modules/auth/services/sign-in-up.service.ts
index abc123..def456 100644
--- a/packages/twenty-server/src/engine/core-modules/auth/services/sign-in-up.service.ts
+++ b/packages/twenty-server/src/engine/core-modules/auth/services/sign-in-up.service.ts
@@ -35,6 +35,7 @@ import { WorkspaceInvitationService } from 'src/engine/core-modules/workspace-i
 import { AuthProviderEnum } from 'src/engine/core-modules/workspace/types/workspace.type';
 import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
+import { WorkspaceService } from 'src/engine/core-modules/workspace/services/workspace.service';
 import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
 
@@ -56,6 +57,7 @@ export class SignInUpService {
     private readonly twentyConfigService: TwentyConfigService,
     private readonly domainManagerService: DomainManagerService,
     private readonly userService: UserService,
+    private readonly workspaceService: WorkspaceService,
   ) {}
 
@@ -397,7 +399,7 @@ export class SignInUpService {
     logo,
   });
 
-  const workspace = await this.workspaceRepository.save(workspaceToCreate);
+  let workspace = await this.workspaceRepository.save(workspaceToCreate);
 
   const isExistingUser = userData.type === 'existingUser';
   const user = isExistingUser
@@ -415,12 +417,38 @@ export class SignInUpService {
       : userData.newUserWithPicture.picture,
   });
 
+  // Activate workspace immediately
+  try {
+    const displayName = user.firstName
+      ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}'s Workspace`
+      : 'My Workspace';
+
+    workspace = await this.workspaceService.activateWorkspace(
+      user,
+      workspace,
+      { displayName },
+    );
+  } catch (error) {
+    // Rollback: Clean up workspace if activation fails
+    try {
+      await this.userWorkspaceService.deleteByWorkspaceId(workspace.id);
+    } catch {
+      // Ignore errors during cleanup
+    }
+    
+    try {
+      await this.workspaceRepository.delete(workspace.id);
+    } catch {
+      // Ignore errors during cleanup
+    }
+
+    throw new AuthException(
+      'Failed to activate workspace',
+      AuthExceptionCode.INTERNAL_SERVER_ERROR,
+      {
+        userFriendlyMessage: t`Failed to create workspace. Please try again.`,
+        originalError: error,
+      },
+    );
+  }
+
   await this.activateOnboardingForUser(user, workspace);
 
-  await this.onboardingService.setOnboardingInviteTeamPending({
-    workspaceId: workspace.id,
-    value: true,
-  });
-
   return { user, workspace };
 }
```

---

## Rollback Instructions

If you need to revert these changes:

```bash
# Revert the commit
git revert <commit-hash>

# Or manually restore the file
git checkout HEAD~1 -- packages/twenty-server/src/engine/core-modules/auth/services/sign-in-up.service.ts

# Commit the revert
git commit -m "Revert: workspace creation fix"
git push
```

---

## Success Criteria

After deployment, verify:

- ✅ All new workspaces have `activationStatus = 'ACTIVE'`
- ✅ No workspaces stuck in `PENDING_CREATION`
- ✅ Each new workspace has at least one WorkspaceMember
- ✅ GraphQL queries work immediately on new workspaces
- ✅ No workspace creation errors in logs
- ✅ No database constraint violations

---

**Status**: Ready for Implementation  
**Risk Level**: Low  
**Estimated Time**: 2 hours