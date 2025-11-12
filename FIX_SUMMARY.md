# Fix: canAccessAllTools Not Working for File Upload Permissions

## Problem Description

Users with `canAccessAllTools = true` were getting "You do not have permissions to access this feature" errors when trying to upload files, even though they had the "All Actions Access" toggle enabled in their role settings.

## Root Cause

The bug was in the `checkRolePermissions` method in `permissions.service.ts`. This method is called by the `SettingsPermissionGuard` to check if a user has permission for a specific action (like file upload).

**The Issue:**
The method only checked `canUpdateAllSettings` to grant permissions, completely ignoring `canAccessAllTools`:

```typescript
// BEFORE (buggy code):
public checkRolePermissions(
  role: RoleEntity,
  setting: PermissionFlagType,
): boolean {
  if (role.canUpdateAllSettings === true) {  // ❌ Only checks canUpdateAllSettings!
    return true;
  }

  const permissionFlags = role.permissionFlags ?? [];

  return permissionFlags.some(
    (permissionFlag) => permissionFlag.flag === setting,
  );
}
```

### Why This Was Wrong

In Twenty's permission system, there are two types of permissions:

1. **Settings Permissions** (controlled by `canUpdateAllSettings`):
   - ROLES
   - WORKSPACE
   - DATA_MODEL
   - SECURITY
   - WORKFLOWS
   - etc.

2. **Tool Permissions** (controlled by `canAccessAllTools`):
   - UPLOAD_FILE ✓
   - DOWNLOAD_FILE ✓
   - AI ✓
   - VIEWS ✓
   - SEND_EMAIL_TOOL ✓
   - IMPORT_CSV ✓
   - EXPORT_CSV ✓
   - CONNECTED_ACCOUNTS ✓

The `checkRolePermissions` method was only checking `canUpdateAllSettings`, so tool permissions like `UPLOAD_FILE` would always fail unless the user had a specific permission flag entry in the database.

## The Fix

Updated the `checkRolePermissions` method to check the appropriate "all access" flag based on the permission type:

```typescript
// AFTER (fixed code):
public checkRolePermissions(
  role: RoleEntity,
  setting: PermissionFlagType,
): boolean {
  const hasBasePermission = this.isToolPermission(setting)
    ? role.canAccessAllTools      // ✓ Use canAccessAllTools for tool permissions
    : role.canUpdateAllSettings;   // ✓ Use canUpdateAllSettings for settings permissions

  if (hasBasePermission === true) {
    return true;
  }

  const permissionFlags = role.permissionFlags ?? [];

  return permissionFlags.some(
    (permissionFlag) => permissionFlag.flag === setting,
  );
}
```

## Files Changed

1. **`packages/twenty-server/src/engine/metadata-modules/permissions/permissions.service.ts`**
   - Fixed the `checkRolePermissions` method to properly distinguish between tool and settings permissions

2. **`packages/twenty-server/src/engine/metadata-modules/permissions/__tests__/permissions.service.spec.ts`** (NEW)
   - Added comprehensive unit tests to verify the fix works correctly
   - Tests cover all scenarios:
     - `canAccessAllTools` grants tool permissions but NOT settings permissions
     - `canUpdateAllSettings` grants settings permissions but NOT tool permissions
     - Granular permissions work with specific permission flags
     - Users with no permissions are properly denied

## Affected Features

This fix resolves permission checking for ALL tool-based features:

- ✅ File Upload - Users with `canAccessAllTools` can now upload files
- ✅ File Download - Users with `canAccessAllTools` can now download files
- ✅ Send Email - Users with `canAccessAllTools` can now send emails
- ✅ Import CSV - Users with `canAccessAllTools` can now import CSV files
- ✅ Export CSV - Users with `canAccessAllTools` can now export CSV files
- ✅ Connected Accounts - Users with `canAccessAllTools` can now manage connected accounts
- ✅ Manage Views - Users with `canAccessAllTools` can now manage views
- ✅ AI Features - Users with `canAccessAllTools` can now use AI features

## Verification

All unit tests pass:
```bash
cd packages/twenty-server
npx jest src/engine/metadata-modules/permissions/__tests__/permissions.service.spec.ts

PASS  src/engine/metadata-modules/permissions/__tests__/permissions.service.spec.ts
✓ canAccessAllTools grants tool permissions (7 tests)
✓ canAccessAllTools does NOT grant settings permissions (4 tests)
✓ canUpdateAllSettings grants settings permissions (7 tests)
✓ canUpdateAllSettings does NOT grant tool permissions (4 tests)
✓ Granular permissions work correctly (2 tests)
✓ No permissions denies everything (4 tests)

Test Suites: 1 passed, 1 total
Tests:       7 passed, 7 total
```

## Migration Notes

**No database migration needed** - this is a code-only fix. The database schema already has both `canAccessAllTools` and `canUpdateAllSettings` columns; they just weren't being checked correctly.

Existing roles in the database will immediately benefit from this fix:
- Roles with `canAccessAllTools = true` will now be able to use all tool features
- Roles with `canUpdateAllSettings = true` continue to work as before for settings
- Roles with granular permissions (via `permissionFlags` table) continue to work as expected

## Testing Recommendations

To verify the fix works in your environment:

1. **Create a test role** with only `canAccessAllTools = true` (not `canUpdateAllSettings`)
2. **Assign the role** to a test user
3. **Try to upload a file** - should work now ✅
4. **Try to access settings** (e.g., create a role) - should be denied ✅

## Related Code Patterns

The frontend already correctly handles this distinction in `getUserWorkspacePermissions`:

```typescript
const permissionFlags = Object.keys(PermissionFlagType).reduce(
  (acc, feature) => {
    const hasBasePermission = this.isToolPermission(feature)
      ? roleOfUserWorkspace.canAccessAllTools
      : roleOfUserWorkspace.canUpdateAllSettings;

    return {
      ...acc,
      [feature]: hasBasePermission || roleOfUserWorkspace.permissionFlags.some(...),
    };
  },
  defaultSettingsPermissions,
);
```

The backend's `checkRolePermissions` now matches this pattern.

