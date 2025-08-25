# Person Management & Workspace Invitation API

## Overview

Tài liệu này mô tả các endpoint để:
1. Tạo mới person (contact) trong CRM
2. Tạo link mời person tham gia workspace để trở thành user

## Base URL

```
POST /graphql
```

---

## 1. Create Person

Tạo một person (contact) mới trong hệ thống CRM.

**Endpoint:** `createPerson`  
**Type:** Mutation  
**Authentication:** Required (Workspace Access Token)

### Input

```graphql
mutation CreatePerson($input: PersonCreateInput!) {
  createPerson(data: $input) {
    id
    name {
      firstName
      lastName
    }
    email
    phone
    jobTitle
    company {
      id
      name
    }
    city
    avatarUrl
    linkedinLink {
      url
      label
    }
    createdAt
    updatedAt
  }
}
```

### PersonCreateInput Schema

```typescript
type PersonCreateInput = {
  // Basic Information
  name?: {
    firstName: string;
    lastName: string;
  };
  email?: string;
  phone?: string;
  
  // Professional Information  
  jobTitle?: string;
  companyId?: string; // UUID of existing company
  
  // Contact Details
  city?: string;
  avatarUrl?: string;
  
  // Social Links
  linkedinLink?: {
    url: string;
    label?: string;
  };
  
  // System Fields (optional)
  id?: string;
  createdAt?: DateTime;
}
```

### Request Example

```json
{
  "input": {
    "name": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "emails": {
      "primaryEmail": "john.doe123@example.com",
      "additionalEmails": []
    },
    "phones": {
      "primaryPhoneNumber": "1234567890",
      "primaryPhoneCountryCode": "US",
      "primaryPhoneCallingCode": "+1",
      "additionalPhones": []
    }
  }
}
```

### Response Example

```json
{
  "data": {
    "createPerson": {
      "id": "person-uuid-generated",
      "name": {
        "firstName": "John",
        "lastName": "Doe"
      },
      "email": "john.doe@example.com",
      "phone": "+1234567890",
      "jobTitle": "Software Engineer",
      "company": {
        "id": "company-uuid-here",
        "name": "Tech Corp Inc"
      },
      "city": "San Francisco",
      "avatarUrl": null,
      "createdAt": "2024-01-01T10:00:00Z"
    }
  }
}
```

### cURL Example

```bash
curl -X POST https://api.twenty.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WORKSPACE_ACCESS_TOKEN" \
  -d '{
    "query": "mutation CreatePerson($input: PersonCreateInput!) { createPerson(data: $input) { id name { firstName lastName } email phone jobTitle city createdAt } }",
    "variables": {
      "input": {
        "name": {
          "firstName": "John",
          "lastName": "Doe"
        },
        "email": "john.doe@example.com",
        "phone": "+1234567890",
        "jobTitle": "Software Engineer",
        "city": "San Francisco"
      }
    }
  }'
```

---

## 2. Send Workspace Invitations

Gửi lời mời tham gia workspace đến một hoặc nhiều email addresses. Người nhận sẽ trở thành user của workspace sau khi chấp nhận lời mời.

**Endpoint:** `sendInvitations`  
**Type:** Mutation  
**Authentication:** Required (Workspace Access Token + WORKSPACE_MEMBERS permission)

### Input

```graphql
mutation SendInvitations($emails: [String!]!) {
  sendInvitations(emails: $emails) {
    success
    errors
    result {
      id
      email
      expiresAt
    }
  }
}
```

### Request Example

```json
{
  "query": "mutation SendInvitations($emails: [String!]!) { sendInvitations(emails: $emails) { success errors result { id email expiresAt } } }",
  "variables": {
    "emails": [
      "john.doe@example.com",
      "jane.smith@example.com",
      "bob.wilson@example.com"
    ]
  }
}
```

### Response Example

```json
{
  "data": {
    "sendInvitations": {
      "success": true,
      "errors": [],
      "result": [
        {
          "id": "invitation-uuid-1",
          "email": "john.doe@example.com",
          "expiresAt": "2024-01-08T10:00:00Z"
        },
        {
          "id": "invitation-uuid-2", 
          "email": "jane.smith@example.com",
          "expiresAt": "2024-01-08T10:00:00Z"
        },
        {
          "id": "invitation-uuid-3",
          "email": "bob.wilson@example.com", 
          "expiresAt": "2024-01-08T10:00:00Z"
        }
      ]
    }
  }
}
```

### cURL Example

```bash
curl -X POST https://api.twenty.com/graphql \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_WORKSPACE_ACCESS_TOKEN" \
  -d '{
    "query": "mutation SendInvitations($emails: [String!]!) { sendInvitations(emails: $emails) { success errors result { id email expiresAt } } }",
    "variables": {
      "emails": [
        "john.doe@example.com",
        "jane.smith@example.com"
      ]
    }
  }'
```

---

## 3. Combined Workflow: Create Person + Send Invitation

Quy trình hoàn chỉnh để tạo person và gửi lời mời:

### Step 1: Create Person

```graphql
mutation CreatePerson($input: PersonCreateInput!) {
  createPerson(data: $input) {
    id
    name { firstName lastName }
    email
    jobTitle
    company { name }
  }
}
```

### Step 2: Send Invitation to Person's Email

```graphql
mutation SendInvitations($emails: [String!]!) {
  sendInvitations(emails: $emails) {
    success
    errors
    result { id email expiresAt }
  }
}
```

### Complete JavaScript Example

```javascript
// Step 1: Create person
const createPersonMutation = `
  mutation CreatePerson($input: PersonCreateInput!) {
    createPerson(data: $input) {
      id
      name { firstName lastName }
      email
      jobTitle
    }
  }
`;

const personData = {
  name: { firstName: "John", lastName: "Doe" },
  email: "john.doe@example.com",
  jobTitle: "Marketing Director",
  city: "New York"
};

const createResponse = await fetch('https://api.twenty.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    query: createPersonMutation,
    variables: { input: personData }
  })
});

const { data: personResult } = await createResponse.json();
console.log('Person created:', personResult.createPerson);

// Step 2: Send workspace invitation
const sendInvitationMutation = `
  mutation SendInvitations($emails: [String!]!) {
    sendInvitations(emails: $emails) {
      success
      errors
      result { id email expiresAt }
    }
  }
`;

const inviteResponse = await fetch('https://api.twenty.com/graphql', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    query: sendInvitationMutation,
    variables: { emails: [personResult.createPerson.email] }
  })
});

const { data: inviteResult } = await inviteResponse.json();
console.log('Invitation sent:', inviteResult.sendInvitations);
```

---

## 4. Get Workspace Invitations

Lấy danh sách các lời mời đang active trong workspace.

**Endpoint:** `findWorkspaceInvitations`  
**Type:** Query  
**Authentication:** Required (Workspace Access Token + WORKSPACE_MEMBERS permission)

### Input

```graphql
query GetWorkspaceInvitations {
  findWorkspaceInvitations {
    id
    email
    expiresAt
    createdAt
  }
}
```

### Response Example

```json
{
  "data": {
    "findWorkspaceInvitations": [
      {
        "id": "invitation-uuid-1",
        "email": "john.doe@example.com",
        "expiresAt": "2024-01-08T10:00:00Z",
        "createdAt": "2024-01-01T10:00:00Z"
      },
      {
        "id": "invitation-uuid-2",
        "email": "jane.smith@example.com", 
        "expiresAt": "2024-01-08T10:00:00Z",
        "createdAt": "2024-01-01T10:00:00Z"
      }
    ]
  }
}
```

---

## 5. Delete Workspace Invitation

Hủy một lời mời workspace đã gửi.

**Endpoint:** `deleteWorkspaceInvitation`  
**Type:** Mutation  
**Authentication:** Required (Workspace Access Token + WORKSPACE_MEMBERS permission)

### Input

```graphql
mutation DeleteWorkspaceInvitation($appTokenId: String!) {
  deleteWorkspaceInvitation(appTokenId: $appTokenId)
}
```

### Request Example

```json
{
  "query": "mutation DeleteWorkspaceInvitation($appTokenId: String!) { deleteWorkspaceInvitation(appTokenId: $appTokenId) }",
  "variables": {
    "appTokenId": "invitation-uuid-to-delete"
  }
}
```

### Response Example

```json
{
  "data": {
    "deleteWorkspaceInvitation": "success"
  }
}
```

---

## Invitation Link Structure

Khi gửi lời mời, hệ thống sẽ tạo các loại link:

### Personal Invitation Link (Recommended)
```
http://localhost:3001/invite/{workspaceInviteHash}?inviteToken={personalToken}&email={email}
```

### Generic Invitation Link
```
http://localhost:3001/invite/{workspaceInviteHash}
```
- {workspaceInviteHash}: Mã hash duy nhất cho workspace, dùng chung cho tất cả lời mời. Lấy tại bảng workspace -> inviteHash
- {personalToken}: Token riêng cho mỗi email, dùng để xác thực người nhận
- **Personal Invitation**: Có token riêng cho email cụ thể, bảo mật cao hơn
- **Generic Invitation**: Chỉ sử dụng workspace invite hash, ít bảo mật hơn

---

## Error Handling

### Common Errors

#### Person Creation Errors

```json
{
  "errors": [
    {
      "message": "Email already exists",
      "extensions": {
        "code": "DUPLICATE_EMAIL"
      }
    }
  ]
}
```

#### Invitation Errors

```json
{
  "data": {
    "sendInvitations": {
      "success": false,
      "errors": [
        "john.doe@example.com already invited",
        "jane.smith@example.com is already in the workspace"
      ],
      "result": []
    }
  }
}
```

#### Permission Errors

```json
{
  "errors": [
    {
      "message": "Access denied",
      "extensions": {
        "code": "FORBIDDEN",
        "exception": {
          "message": "Insufficient permissions for WORKSPACE_MEMBERS"
        }
      }
    }
  ]
}
```

---

## Security & Best Practices

### 1. Authentication
- Sử dụng workspace-specific access token
- Token phải có quyền truy cập workspace tương ứng

### 2. Permissions
- `sendInvitations` yêu cầu `WORKSPACE_MEMBERS` permission
- Chỉ workspace admins/members có quyền mời người khác

### 3. Rate Limiting
- Giới hạn số lượng lời mời gửi trong một thời gian
- Tránh spam email

### 4. Email Validation
- Email addresses được validate trước khi gửi
- Không cho phép duplicate invitations

### 5. Expiration
- Invitation tokens có thời hạn (thường 7 ngày)
- Expired tokens sẽ không thể sử dụng

---

## Data Types

### PersonCreateInput
```typescript
type PersonCreateInput = {
  id?: string;
  name?: FullNameCreateInput;
  email?: string;
  phone?: string;
  jobTitle?: string;
  companyId?: string;
  city?: string;
  avatarUrl?: string;
  linkedinLink?: LinkCreateInput;
  createdAt?: DateTime;
}

type FullNameCreateInput = {
  firstName: string;
  lastName: string;
}

type LinkCreateInput = {
  url: string;
  label?: string;
}
```

### SendInvitationsOutput
```typescript
type SendInvitationsOutput = {
  success: boolean;
  errors: string[];
  result: WorkspaceInvitation[];
}

type WorkspaceInvitation = {
  id: string;
  email: string;
  expiresAt: DateTime;
  createdAt?: DateTime;
}
```