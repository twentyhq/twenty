# Super Admin Impersonation Feature

## Tổng quan

Tính năng này cho phép Super Admin:
1. **Đăng nhập vào bất kỳ workspace nào** mà không cần là thành viên
2. **Tạo token impersonation** để truy cập workspace khác  
3. **Sử dụng toàn quyền** trong mọi workspace như một thành viên thực thụ

## Cách thức hoạt động

### 1. Super Admin Authentication Flow

Super Admin có 2 cách truy cập workspace:

#### A. Đăng nhập trực tiếp (Direct Login)
- Super Admin có thể đăng nhập vào bất kỳ workspace nào
- Hệ thống sẽ bypass workspace membership check
- Tự động tạo UserWorkspace record nếu cần thiết

#### B. Impersonation Token  
- Tạo token đặc biệt để truy cập workspace khác
- Token có cấu trúc payload mở rộng với impersonation flags

### 2. Cấu trúc Token

#### Normal Super Admin Token:
```typescript
{
  sub: string;                    // Super Admin User ID
  userId: string;                 // Super Admin User ID
  workspaceId: string;           // Current Workspace ID
  type: 'ACCESS';                // Token type
  userWorkspaceId: string;       // Auto-created if needed
  // Super Admin bypass enabled in middleware
}
```

#### Impersonation Token:
```typescript
{
  sub: string;                    // Super Admin User ID
  userId: string;                 // Super Admin User ID
  workspaceId: string;           // Target Workspace ID
  type: 'ACCESS';                // Token type
  // Impersonation specific fields
  isImpersonating: true;         // Flag để identify impersonation
  realUserId: string;            // Super Admin User ID (for logging)
  impersonatedWorkspaceId: string; // Target Workspace ID (for validation)
}
```

### 3. API Endpoints

#### A. Impersonation Endpoint
**POST** `/rest/admin/workspaces/:workspaceId/impersonate`

**Headers:**
- `Authorization: Bearer <super-admin-token>`
- `Content-Type: application/json`

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresAt": "2024-01-01T12:00:00.000Z"
}
```

#### B. Regular Login (với Super Admin bypass)
- `GetLoginTokenFromCredentials` - Có thể đăng nhập vào workspace bất kỳ
- `GetAuthTokensFromLoginToken` - Tự động tạo access token

### 4. Validation Logic

1. **Super Admin Check**: `user.canAccessFullAdminPanel === true`
2. **Workspace Access**: Super Admin có thể truy cập mọi workspace
3. **Token Creation**: Bypass workspace membership requirements
4. **UserWorkspace Auto-Creation**: Tự động tạo record khi cần thiết

## Cách sử dụng

### Bước 1: Tạo Super Admin
```sql
-- Cập nhật user thành Super Admin
UPDATE "core"."user" 
SET "canAccessFullAdminPanel" = true 
WHERE "email" = 'admin@example.com';
```

### Bước 2: Đăng nhập Super Admin
Super Admin có thể đăng nhập vào **bất kỳ workspace nào** thông qua UI:
1. Mở login page của workspace bất kỳ
2. Nhập email/password của Super Admin
3. Hệ thống sẽ tự động bypass membership check
4. Lấy access token từ browser hoặc API response

### Bước 3: Test Impersonation API
```bash
# Lấy access token từ bước 2, sau đó:
curl -X POST \
  'http://localhost:3000/rest/admin/workspaces/TARGET_WORKSPACE_ID/impersonate' \
  -H 'Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN' \
  -H 'Content-Type: application/json'
```

### Bước 4: Sử dụng Impersonation Token
```bash
curl -X GET \
  'http://localhost:3000/rest/objects/people' \
  -H 'Authorization: Bearer YOUR_IMPERSONATION_TOKEN' \
  -H 'Content-Type: application/json'
```

## Test Scripts

### Test Script 1: Manual curl test
```bash
cd packages/twenty-server
chmod +x curl-test.sh
./curl-test.sh
```

### Test Script 2: Node.js test
```bash
cd packages/twenty-server  
node test-impersonation.js
```

**Lưu ý**: Cần cập nhật token và workspace ID trong scripts.

## Security Considerations

1. **Super Admin Only**: Chỉ user có `canAccessFullAdminPanel = true` mới có thể:
   - Đăng nhập vào workspace bất kỳ
   - Tạo impersonation token
2. **Workspace Specific**: Impersonation token chỉ có thể truy cập đúng workspace được chỉ định
3. **Token Expiry**: Token có thời gian hết hạn như normal access token
4. **Audit Trail**: 
   - `realUserId` được lưu trong impersonation token
   - UserWorkspace records được tạo tự động để tracking
5. **No Breaking Changes**: User thường vẫn hoạt động bình thường

## Cấu trúc Code

### Files đã tạo/chỉnh sửa:

#### Core Authentication
1. `/src/engine/core-modules/auth/types/auth-context.type.ts` - Extended AccessTokenJwtPayload
2. `/src/engine/core-modules/auth/strategies/jwt.auth.strategy.ts` - Super Admin bypass logic
3. `/src/engine/core-modules/auth/services/auth.service.ts` - Login flow bypass
4. `/src/engine/core-modules/auth/token/services/access-token.service.ts` - Token generation bypass

#### Impersonation Module
5. `/src/engine/core-modules/auth/services/admin-impersonation.service.ts` - Impersonation service
6. `/src/engine/api/rest/admin/admin-impersonation.controller.ts` - REST controller
7. `/src/engine/api/rest/admin/admin-impersonation.module.ts` - Module configuration

#### User & Workspace Services
8. `/src/engine/core-modules/user/services/user.service.ts` - Workspace access bypass
9. `/src/app.module.ts` - Added AdminImpersonationModule

### Architecture Flow:

#### Direct Login Flow:
1. **User Input** → Login credentials
2. **AuthService.checkAccessAndUseInvitationOrThrow()** → Super Admin bypass
3. **UserService.hasUserAccessToWorkspaceOrThrow()** → Super Admin bypass  
4. **AccessTokenService.generateAccessToken()** → Auto-create UserWorkspace
5. **Success** → Super Admin có access token

#### Impersonation Flow:
1. **Request** → `AdminImpersonationController`
2. **Validation** → `AdminPanelGuard` (check Super Admin)
3. **Token Generation** → `AdminImpersonationService`
4. **Token Usage** → `JwtAuthStrategy` (handle impersonation logic)
5. **Access Control** → Middleware allows access to specified workspace

## Troubleshooting

### Resolved Issues:

✅ **"You're not member of this workspace" (Login)**
- **Fix**: Added Super Admin bypass in `AuthService.checkAccessAndUseInvitationOrThrow()`

✅ **"User is not a member of the workspace" (Token)**  
- **Fix**: Added Super Admin bypass in `AccessTokenService.generateAccessToken()`

✅ **"UserWorkspace not found"**
- **Fix**: Auto-create UserWorkspace record for Super Admin

✅ **"Token invalid" during authentication**
- **Fix**: Proper impersonation flag checking (`isImpersonating === true`)

### Common Issues:

1. **"User not authorized to impersonate"**
   - Đảm bảo `user.canAccessFullAdminPanel = true`
   - Kiểm tra user đã được set Super Admin đúng cách

2. **"Invalid impersonation workspace"**  
   - Kiểm tra `workspaceId` trong request URL
   - Đảm bảo workspace ID tồn tại

3. **"Workspace not found"**
   - Kiểm tra workspace ID có tồn tại trong database
   - Kiểm tra format UUID đúng

4. **401 Unauthorized**
   - Kiểm tra Super Admin token còn hạn
   - Kiểm tra header Authorization format
   - Verify token signature

### Debug Steps:
1. **Kiểm tra Super Admin status**:
   ```sql
   SELECT email, "canAccessFullAdminPanel" FROM "core"."user" WHERE email = 'your@email.com';
   ```

2. **Kiểm tra workspace existence**:
   ```sql  
   SELECT id, "displayName" FROM "core"."workspace";
   ```

3. **Check server logs** để debug chi tiết

4. **Test với curl** trước khi dùng UI

## Status: ✅ COMPLETED

Tính năng Super Admin Impersonation đã hoàn thành và tested thành công!

**Capabilities:**
- ✅ Super Admin có thể đăng nhập vào bất kỳ workspace nào
- ✅ Tạo impersonation token cho workspace khác
- ✅ Truy cập full API như member thực thụ  
- ✅ Audit trail và security được duy trì
- ✅ Không breaking changes cho user thường