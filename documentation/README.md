# Twenty Server Commands Documentation

This document provides detailed instructions for running two essential Twenty server commands for automated workspace creation and API token generation.

## Overview

These commands are designed for programmatic workspace setup and API access, particularly useful for:
- Automated deployment scenarios
- Workspace provisioning and admin user creation
- Headless server setups
- Development environment automation

## Prerequisites

Before executing these commands, ensure you have completed the following setup steps:

### 1. Database Schema Synchronization

Reset the database schema without any seeded workspace or user data:

```bash
nx database:reset twenty-server --configuration=no-seed
```

**What this does:**
- Truncates all existing database tables
- Sets up fresh database schema
- Runs all necessary migrations
- Flushes cache
- **Does NOT** create any demo workspaces or users

### 2. Build the Twenty Server

Build the server application before executing commands:

```bash
yarn nx run twenty-server:build
```

**What this does:**
- Compiles TypeScript to JavaScript
- Generates the `dist/` directory with compiled code
- Prepares the application for production execution

## Command 1: Automate Workspace Creation

### Purpose
Creates a new workspace with an admin user programmatically, bypassing the web interface signup flow.

### Command Syntax
```bash
yarn command:prod workspace:signup --username="" --password="" --workspace-name="" --timezone="America/New_York" --admin-first-name="" --admin-last-name=""
```

### Parameters

| Parameter | Flag | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| Username | `--username`, `-u` | ✅ | Admin user email address (must be valid email format) | `admin@company.com` |
| Password | `--password`, `-p` | ✅ | Admin user password (minimum 8 characters) | `SecurePass123!` |
| Workspace Name | `--workspace-name`, `-w` | ✅ | Display name for the workspace | `"My Company Workspace"` |
| Timezone | `--timezone`, `-t` | ❌ | Workspace timezone (default: America/New_York) | `"Europe/London"` |
| Admin First Name | `--admin-first-name`, `-f` | ✅ | First name of the admin user | `"John"` |
| Admin Last Name | `--admin-last-name`, `-l` | ✅ | Last name of the admin user | `"Doe"` |
| Locale | `--locale` | ❌ | User interface locale (default: en) | `"fr"` |

### Example Usage
```bash
yarn command:prod workspace:signup \
  --username="admin@mycompany.com" \
  --password="MySecurePassword123!" \
  --workspace-name="MyCompany CRM" \
  --timezone="America/New_York" \
  --admin-first-name="John" \
  --admin-last-name="Smith"
```

### What This Command Does

1. **Validates Input:**
   - Checks email format
   - Verifies password strength (minimum 8 characters)
   - Ensures user doesn't already exist

2. **Creates Workspace:**
   - Generates unique workspace subdomain
   - Sets up workspace with pending activation status
   - Configures workspace logo (if work email detected)

3. **Creates Admin User:**
   - Hashes the provided password
   - Creates user with admin privileges
   - Sets `canImpersonate` and `canAccessFullAdminPanel` to true

4. **Activates Workspace:**
   - Activates the workspace with the provided display name
   - Generates workspace URLs

### Success Output
```
============================================================
WORKSPACE CREATION SUCCESSFUL
============================================================

WORKSPACE DETAILS
============================================================
Workspace ID: 550e8400-e29b-41d4-a716-446655440000
Workspace Name: MyCompany CRM
Workspace Subdomain: mycompany-crm-abc123
Workspace URL: https://mycompany-crm-abc123.twenty.com
Activation Status: ACTIVE

ADMIN USER SETUP CONFIRMED
============================================================
Admin User ID: 550e8400-e29b-41d4-a716-446655440001
Admin Email: admin@mycompany.com
Admin First Name: John
Admin Last Name: Smith
Can Impersonate: true
Can Access Full Admin Panel: true
Email Verified: false

Workspace is ready for use!
============================================================
```

### Use Cases

- **Automated Deployments:** Set up workspaces during application deployment
- **Migration Scripts:** Workspace creation from existing systems

## Command 2: Generate API Tokens

### Purpose
Creates API tokens for programmatic access to Twenty's GraphQL and REST APIs.

### Command Syntax
```bash
yarn command:prod apikeys:create-token --workspace="" --name="initial key"
```

### Parameters

| Parameter | Flag | Required | Description | Example |
|-----------|------|----------|-------------|---------|
| Workspace | `--workspace` | ✅ | Workspace display name or ID | `"MyCompany CRM"` |
| Name | `--name` | ✅ | Descriptive name for the API key | `"Production API Key"` |

### Example Usage
```bash
yarn command:prod apikeys:create-token \
  --workspace="MyCompany CRM" \
  --name="Production Integration Key"
```

### What This Command Does

1. **Finds Workspace:**
   - Searches for workspace by display name
   - Validates workspace exists

2. **Creates API Key Record:**
   - Generates unique API key ID
   - Sets expiration to 100 years from creation
   - Stores key metadata in workspace schema

3. **Generates JWT Token:**
   - Creates signed JWT with workspace context
   - Includes workspace ID and API key ID in payload
   - Sets token type as 'API_KEY'

### Success Output
```
============================================================
API KEY CREATION SUCCESSFUL
============================================================

API KEY DETAILS
============================================================
Name: Production Integration Key
API Key ID: 550e8400-e29b-41d4-a716-446655440002
API Key Token: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Workspace ID: 550e8400-e29b-41d4-a716-446655440000
Workspace Name: MyCompany CRM
Expires At: 2124-12-31T23:59:59.999Z
============================================================
```

### Using the API Token

Once generated, use the token in API requests:

**GraphQL API:**
```bash
curl -X POST http://localhost:3000/graphql \
  -H "Authorization: Bearer YOUR_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"query": "{ currentUser { id email } }"}'
```

**REST API:**
```bash
curl -X GET http://localhost:3000/rest/companies \
  -H "Authorization: Bearer YOUR_API_TOKEN"
```

## Complete Workflow Example

Here's a complete example of setting up a new workspace and generating an API token:

```bash
# Step 1: Reset database (removes all existing data)
nx database:reset twenty-server --configuration=no-seed

# Step 2: Build the server
yarn nx run twenty-server:build

# Step 3: Create workspace
yarn command:prod workspace:signup \
  --username="admin@acmecorp.com" \
  --password="SecurePassword123!" \
  --workspace-name="ACME Corporation" \
  --timezone="America/Los_Angeles" \
  --admin-first-name="Jane" \
  --admin-last-name="Doe"

# Step 4: Generate API token
yarn command:prod apikeys:create-token \
  --workspace="ACME Corporation" \
  --name="Main API Key"
```

## Error Handling

### Common Errors and Solutions

**Workspace Creation Errors:**
- `Invalid email format`: Ensure username is a valid email address
- `User already exists`: Use a different email or reset database
- `Password too short`: Use minimum 8 characters
- `Workspace creation disabled`: Check if multiworkspace is enabled

**API Key Creation Errors:**
- `Workspace not found`: Verify workspace name matches exactly
- `Database connection failed`: Ensure database is running and accessible

## Security Considerations

- **API Tokens:** Store tokens securely and rotate them regularly
- **Admin Passwords:** Use strong passwords and consider password policies
- **Database Access:** Ensure database is properly secured in production
- **Token Expiration:** Monitor token expiration dates (default: 100 years)


---

**Note:** These commands are designed for server-side automation. For interactive workspace creation, use the web interface at your Twenty instance URL.
