# Super Admin Login Fix

## Vấn đề gốc
Super Admin gặp lỗi "You're not member of this workspace" khi trying to login vào workspace mà họ không phải là member.

## Nguyên nhân
- Logic kiểm tra workspace membership được thực hiện trong login flow (method `checkAccessAndUseInvitationOrThrow`)
- Logic Super Admin chỉ được xử lý sau khi token được generate trong JWT strategy
- Vì vậy Super Admin bị block ngay từ bước login, không đến được bước xác thực token

## Giải pháp
Đã thêm Super Admin check vào 2 method chính:

### 1. AuthService.checkAccessAndUseInvitationOrThrow()
**File:** `/src/engine/core-modules/auth/services/auth.service.ts`

```typescript
private async checkAccessAndUseInvitationOrThrow(
  workspace: Workspace,
  user: User,
) {
  // Super Admin can access any workspace without being a member
  if (user.canAccessFullAdminPanel) {
    return;
  }
  
  // ... rest of existing logic
}
```

### 2. UserService.hasUserAccessToWorkspaceOrThrow()
**File:** `/src/engine/core-modules/user/services/user.service.ts`

```typescript
async hasUserAccessToWorkspaceOrThrow(userId: string, workspaceId: string) {
  const user = await this.userRepository.findOne({
    where: { id: userId },
    relations: ['workspaces'],
  });

  // Super Admin can access any workspace without being a member
  if (user.canAccessFullAdminPanel) {
    return;
  }
  
  // ... rest of existing logic
}
```

## Luồng hoạt động mới
1. User với `canAccessFullAdminPanel=true` gọi `getLoginTokenFromCredentials`
2. System gọi `validateLoginWithPassword` → `checkAccessAndUseInvitationOrThrow`
3. Method check `user.canAccessFullAdminPanel` → return early (bypass workspace membership check)
4. Login token được generate thành công
5. User có thể access workspace mà không cần là member

## Các file đã thay đổi
- `/src/engine/core-modules/auth/services/auth.service.ts`
- `/src/engine/core-modules/user/services/user.service.ts`

## Test đã pass
- Đã chạy toàn bộ test suite và pass
- Logic JWT strategy đã có sẵn support cho Super Admin impersonation

## Cách kiểm tra
1. Set `canAccessFullAdminPanel=true` cho user trong database
2. Try login vào workspace mà user không phải member  
3. Login should succeed thay vì show "You're not member of this workspace"