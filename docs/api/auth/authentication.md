# Authentication API Documentation

## Overview

The Twenty CRM Authentication API provides GraphQL endpoints for user authentication, including sign up, sign in, and logout functionality. All authentication endpoints use GraphQL mutations and queries.

## Base URL

```
POST /graphql
```

## Authentication Endpoints

### 1. Sign Up (signUp)

Đăng ký tài khoản mới cho user mà không cần workspace.

**Endpoint:** `signUp`  
**Type:** Mutation  
**Guard:** CaptchaGuard, PublicEndpointGuard

#### Input

```graphql
mutation SignUp($email: String!, $password: String!) {
  signUp(email: $email, password: $password) {
    availableWorkspaces {
      id
      displayName
      subdomain
      logo
      loginToken
    }
    tokens {
      accessToken
      refreshToken
    }
  }
}
```

**Input Parameters:**
- `email` (String, required): Email của user
- `password` (String, required): Mật khẩu (tối thiểu 8 ký tự)

#### Response

```json
{
  "data": {
    "signUp": {
      "availableWorkspaces": [
        {
          "id": "workspace-uuid",
          "displayName": "My Workspace",
          "subdomain": "myworkspace",
          "logo": "https://example.com/logo.png",
          "loginToken": "login_token_string"
        }
      ],
      "tokens": {
        "accessToken": "workspace_agnostic_access_token",
        "refreshToken": "refresh_token_string"
      }
    }
  }
}
```

#### cURL Example

```bash
curl -X POST https://api.twenty.com/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation SignUp($email: String!, $password: String!) { signUp(email: $email, password: $password) { availableWorkspaces { id displayName subdomain logo loginToken } tokens { accessToken refreshToken } } }",
    "variables": {
      "email": "user@example.com",
      "password": "securepassword123"
    }
  }'
```

---

### 2. Sign In (signIn)

Đăng nhập với email và mật khẩu hiện có.

**Endpoint:** `signIn`  
**Type:** Mutation  
**Guard:** CaptchaGuard, PublicEndpointGuard

#### Input

```graphql
mutation SignIn($email: String!, $password: String!) {
  signIn(email: $email, password: $password) {
    availableWorkspaces {
      id
      displayName
      subdomain
      logo
      loginToken
    }
    tokens {
      accessToken
      refreshToken
    }
  }
}
```

**Input Parameters:**
- `email` (String, required): Email của user
- `password` (String, required): Mật khẩu
```json
- {
  "email": "jane.austen@apple.dev", ("tim@apple.dev", "jony.ive@apple.dev", "phil.schiler@apple.dev")
  "password": "tim@apple.dev"
  }
```
#### Response

```json
{
  "data": {
    "signIn": {
      "availableWorkspaces": [
        {
          "id": "workspace-uuid-1",
          "displayName": "Personal Workspace",
          "subdomain": "personal",
          "logo": null,
          "loginToken": "login_token_1"
        },
        {
          "id": "workspace-uuid-2", 
          "displayName": "Company Workspace",
          "subdomain": "company",
          "logo": "https://company.com/logo.png",
          "loginToken": "login_token_2"
        }
      ],
      "tokens": {
        "accessToken": "workspace_agnostic_access_token",
        "refreshToken": "refresh_token_string"
      }
    }
  }
}
```

#### cURL Example

```bash
curl -X POST https://api.twenty.com/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation SignIn($email: String!, $password: String!) { signIn(email: $email, password: $password) { availableWorkspaces { id displayName subdomain logo loginToken } tokens { accessToken refreshToken } } }",
    "variables": {
      "email": "user@example.com",
      "password": "securepassword123"
    }
  }'
```

---

### 3. Get Auth Tokens from Login Token

Lấy access token và refresh token từ login token để truy cập vào workspace cụ thể.

**Endpoint:** `getAuthTokensFromLoginToken`  
**Type:** Mutation  
**Guard:** PublicEndpointGuard

#### Input

```graphql
mutation GetAuthTokensFromLoginToken($loginToken: String!, $origin: String!) {
  getAuthTokensFromLoginToken(loginToken: $loginToken, origin: $origin) {
    tokens {
      accessToken
      refreshToken
    }
  }
}
```

**Input Parameters:**
- `loginToken` (String, required): Login token nhận được từ signIn/signUp
- `origin` (String, required): Origin của workspace (ví dụ: "https://myworkspace.twenty.com")

#### Response

```json
{
  "data": {
    "getAuthTokensFromLoginToken": {
      "tokens": {
        "accessToken": "workspace_specific_access_token",
        "refreshToken": "workspace_specific_refresh_token"
      }
    }
  }
}
```

#### cURL Example

```bash
curl -X POST https://api.twenty.com/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation GetAuthTokensFromLoginToken($loginToken: String!, $origin: String!) { getAuthTokensFromLoginToken(loginToken: $loginToken, origin: $origin) { tokens { accessToken refreshToken } } }",
    "variables": {
      "loginToken": "login_token_from_signin",
      "origin": "https://myworkspace.twenty.com"
    }
  }'
```

---

### 4. Renew Token

Làm mới access token bằng refresh token.

**Endpoint:** `renewToken`  
**Type:** Mutation  
**Guard:** PublicEndpointGuard

#### Input

```graphql
mutation RenewToken($appToken: String!) {
  renewToken(appToken: $appToken) {
    tokens {
      accessToken
      refreshToken
    }
  }
}
```

**Input Parameters:**
- `appToken` (String, required): Refresh token hiện tại

#### Response

```json
{
  "data": {
    "renewToken": {
      "tokens": {
        "accessToken": "new_access_token",
        "refreshToken": "new_refresh_token"
      }
    }
  }
}
```

#### cURL Example

```bash
curl -X POST https://api.twenty.com/graphql \
  -H "Content-Type: application/json" \
  -d '{
    "query": "mutation RenewToken($appToken: String!) { renewToken(appToken: $appToken) { tokens { accessToken refreshToken } } }",
    "variables": {
      "appToken": "current_refresh_token"
    }
  }'
```

---

## Logout

Twenty CRM sử dụng JWT tokens nên logout được thực hiện bằng cách:

1. **Client-side logout**: Xóa access token và refresh token khỏi client storage (localStorage, sessionStorage, cookies)
2. **Server-side logout**: Invalidate refresh token nếu cần thiết

### Client-side Logout Implementation

```javascript
// JavaScript example
function logout() {
  // Remove tokens from storage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
  // Redirect to login page
  window.location.href = '/login';
}
```

---

## Error Handling

### Common Error Responses

#### Authentication Failed
```json
{
  "errors": [
    {
      "message": "Invalid credentials",
      "extensions": {
        "code": "INVALID_CREDENTIALS",
        "exception": {
          "stacktrace": [...]
        }
      }
    }
  ]
}
```

#### User Already Exists (Sign Up)
```json
{
  "errors": [
    {
      "message": "User already exists",
      "extensions": {
        "code": "USER_ALREADY_EXISTS"
      }
    }
  ]
}
```

#### Invalid Token
```json
{
  "errors": [
    {
      "message": "Token is invalid or expired",
      "extensions": {
        "code": "INVALID_TOKEN"
      }
    }
  ]
}
```

### HTTP Status Codes

- `200 OK`: Successful authentication
- `400 Bad Request`: Invalid input parameters
- `401 Unauthorized`: Invalid credentials or token
- `403 Forbidden`: Access denied
- `500 Internal Server Error`: Server error

---

## Authentication Flow

### Typical Authentication Flow

1. **User Registration/Login:**
   - Call `signUp` or `signIn` mutation
   - Receive `availableWorkspaces` and workspace-agnostic tokens

2. **Workspace Selection:**
   - User selects a workspace
   - Call `getAuthTokensFromLoginToken` with the workspace's `loginToken`
   - Receive workspace-specific tokens

3. **API Requests:**
   - Use workspace-specific `accessToken` in Authorization header
   - Format: `Authorization: Bearer <access_token>`

4. **Token Refresh:**
   - When access token expires, call `renewToken` with refresh token
   - Receive new tokens

5. **Logout:**
   - Clear tokens from client storage
   - User is logged out

### Token Types

1. **Workspace Agnostic Token**: Token có thể truy cập thông tin user nhưng không truy cập workspace-specific data
2. **Workspace Specific Token**: Token có thể truy cập data của workspace cụ thể
3. **Login Token**: Token tạm thời dùng để exchange sang workspace-specific tokens
4. **Refresh Token**: Token dùng để làm mới access token

---

## Security Notes

1. **HTTPS Only**: Luôn sử dụng HTTPS trong production
2. **Token Storage**: Store tokens securely (preferably httpOnly cookies)
3. **Token Expiration**: Access tokens có thời gian hết hạn ngắn (thường 15 phút)
4. **Captcha Protection**: Các endpoint đăng ký/đăng nhập được bảo vệ bởi captcha
5. **Rate Limiting**: Implement rate limiting để tránh brute force attacks

---

## Data Types

### AvailableWorkspacesAndAccessTokensOutput
```typescript
type AvailableWorkspacesAndAccessTokensOutput = {
  availableWorkspaces: AvailableWorkspace[];
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
```

### AvailableWorkspace
```typescript
type AvailableWorkspace = {
  id: string;
  displayName: string;
  subdomain: string;
  logo?: string;
  loginToken: string;
}
```

### AuthTokens
```typescript
type AuthTokens = {
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}
```