# Super Admin Access Token Generation Fix

## Problem
Super Admin users (với `canAccessFullAdminPanel = true`) không thể convert login token thành access token vì bị block với lỗi "User is not a member of the workspace" trong flow `GetAuthTokensFromLoginToken`.

## Root Cause Analysis

### Flow xảy ra lỗi:
1. **GetAuthTokensFromLoginToken** mutation được gọi (auth.resolver.ts:438-465)
2. **AuthService.verify()** được gọi (auth.service.ts:267-309)
3. **AccessTokenService.generateAccessToken()** được gọi (access-token.service.ts:47-127)
4. **Lỗi xảy ra** ở access-token.service.ts:89-94 khi check workspace membership

### Vấn đề chính:
- Logic trong `AccessTokenService.generateAccessToken()` không có exception cho Super Admin
- Super Admin không có WorkspaceMember record nhưng vẫn cần UserWorkspace record để tạo access token
- Existing logic trong `AuthService.checkAccessAndUseInvitationOrThrow()` đã có Super Admin bypass nhưng không áp dụng cho AccessTokenService

## Solution

### 1. Fix workspace membership check
**File:** `/src/engine/core-modules/auth/token/services/access-token.service.ts`

```typescript
// Old logic (lines 89-94)
if (!workspaceMember) {
  throw new AuthException(
    'User is not a member of the workspace',
    AuthExceptionCode.FORBIDDEN_EXCEPTION,
  );
}

// New logic (lines 89-102)
if (!workspaceMember) {
  // Super Admin can access any workspace without being a member
  if (user.canAccessFullAdminPanel) {
    // For Super Admin, we don't set tokenWorkspaceMemberId since they're not a workspace member
    tokenWorkspaceMemberId = undefined;
  } else {
    throw new AuthException(
      'User is not a member of the workspace',
      AuthExceptionCode.FORBIDDEN_EXCEPTION,
    );
  }
} else {
  tokenWorkspaceMemberId = workspaceMember.id;
}
```

### 2. Fix UserWorkspace record handling
**File:** `/src/engine/core-modules/auth/token/services/access-token.service.ts`

```typescript
// Old logic (lines 104-111)
const userWorkspace = await this.userWorkspaceRepository.findOne({
  where: {
    userId: user.id,
    workspaceId,
  },
});

userWorkspaceValidator.assertIsDefinedOrThrow(userWorkspace);

// New logic (lines 104-128)
let userWorkspace = await this.userWorkspaceRepository.findOne({
  where: {
    userId: user.id,
    workspaceId,
  },
});

// Super Admin might not have a UserWorkspace record, so we need to handle this case
if (!userWorkspace) {
  // If user is Super Admin, we can create a UserWorkspace record for them
  if (user.canAccessFullAdminPanel) {
    // Create a UserWorkspace record for Super Admin if it doesn't exist
    // This ensures Super Admin can access any workspace without explicit membership
    const newUserWorkspace = this.userWorkspaceRepository.create({
      userId: user.id,
      workspaceId,
    });
    
    userWorkspace = await this.userWorkspaceRepository.save(newUserWorkspace);
  } else {
    userWorkspaceValidator.assertIsDefinedOrThrow(userWorkspace);
  }
}

userWorkspaceValidator.assertIsDefinedOrThrow(userWorkspace);
```

## How It Works

### Super Admin Access Flow:
1. Super Admin tries to convert login token to access token
2. System checks workspace membership:
   - If no WorkspaceMember record → allows Super Admin to continue (sets workspaceMemberId = undefined)
   - If regular user → throws error
3. System checks UserWorkspace record:
   - If no UserWorkspace record → creates one automatically for Super Admin
   - If regular user → throws error
4. Access token is generated successfully with proper payload

### Token Payload for Super Admin:
```typescript
const jwtPayload: AccessTokenJwtPayload = {
  sub: user.id,
  userId: user.id,
  workspaceId,
  workspaceMemberId: undefined, // Super Admin doesn't have workspace membership
  userWorkspaceId: userWorkspace.id, // Created automatically if needed
  type: JwtTokenTypeEnum.ACCESS,
  authProvider,
};
```

## Testing

### Prerequisites:
1. User with `canAccessFullAdminPanel = true` in database
2. Workspace where user is NOT a member

### Test Flow:
1. Get login token for the user
2. Call `GetAuthTokensFromLoginToken` mutation
3. Verify access token is generated successfully
4. Verify no "User is not a member of the workspace" error

### Expected Results:
- ✅ Super Admin can convert login token to access token
- ✅ UserWorkspace record is created automatically if needed
- ✅ Access token contains proper payload with workspaceMemberId = undefined
- ✅ Super Admin can access any workspace without membership requirements

## Files Modified

1. **access-token.service.ts** - Added Super Admin logic for workspace membership and UserWorkspace creation
2. **test-super-admin-access-token.js** - Test script to verify the fix
3. **SUPER_ADMIN_ACCESS_TOKEN_FIX.md** - This documentation

## Impact

- Super Admin impersonation now works end-to-end
- No breaking changes for regular users
- Maintains security by only allowing users with `canAccessFullAdminPanel = true`
- Automatically creates necessary database records for Super Admin access

## Related Issues

This fix complements existing Super Admin logic in:
- `AuthService.checkAccessAndUseInvitationOrThrow()` (auth.service.ts:96-98)
- `UserService.hasUserAccessToWorkspaceOrThrow()` (user.service.ts with Super Admin check)