# Security Context — Twenty CRM

## Sensitive Data Inventory

### Critical Secrets (Must Never Leak)
1. **`APP_SECRET`** — Session signing key; compromised = session hijacking, CSRF bypass
2. **`PG_DATABASE_PASSWORD`** / `PG_DATABASE_URL` — Direct database access; compromised = full data breach
3. **OAuth Client Secrets** — `AUTH_GOOGLE_CLIENT_SECRET`, `AUTH_MICROSOFT_CLIENT_SECRET`; compromised = account takeover via OAuth flow
4. **Email SMTP Passwords** — `EMAIL_SMTP_PASSWORD`; compromised = spam/phishing via user's domain
5. **Stripe API Keys** — `BILLING_STRIPE_API_KEY`; compromised = billing manipulation
6. **S3 Credentials** — `STORAGE_S3_ENDPOINT`, access keys; compromised = file data exfiltration
7. **Redis Connection String** — `REDIS_URL`; compromised = session/cache poisoning
8. **ClickHouse Password** — `CLICKHOUSE_PASSWORD`; compromised = analytics data access
9. **JWT Signing Key** — Derived from `APP_SECRET`; compromised = token forgery

### User PII (Personally Identifiable Information)
- **Companies**: Name, domain, industry, employee count
- **People**: Name, email, phone number, job title, LinkedIn profile
- **Opportunities**: Deal amount, stage, close date (business-sensitive)
- **Calendar Events**: Meeting titles, participants, times (in `connectedAccounts` sync)
- **Emails**: Full message content synced from Gmail/Outlook (in `messages` table)
- **Files**: Uploaded attachments (resumes, contracts, etc.)
- **Custom Fields**: Users may store SSNs, credit cards, etc. in custom text fields

### System Metadata (Sensitive but Not PII)
- **Workspace Metadata**: Schema definitions, custom objects/fields (exposes data model)
- **User Roles/Permissions**: Access control rules (reveals privilege escalation paths)
- **Webhooks**: URLs and secrets (compromise = webhook injection)
- **API Keys**: User-generated tokens for REST/GraphQL access

## Trust Boundaries

### External → Frontend (User Browser)
- **Boundary**: Public internet → `twenty-front` (static SPA served by NestJS)
- **Threats**: XSS, CSRF, malicious links in user data
- **Controls**: 
  - Content Security Policy (CSP) headers
  - React escaping (automatic in JSX)
  - DOMPurify for rich-text sanitization (used in BlockNote/TipTap)

### Frontend → Backend (GraphQL/REST API)
- **Boundary**: Browser → `/graphql`, `/metadata`, `/rest/*`
- **Threats**: Unauthorized API access, query injection, data exfiltration
- **Controls**:
  - **Authentication**: JWT in `Authorization: Bearer <token>` header (Passport.js)
  - **Authorization**: Workspace-scoped queries (middleware injects `workspaceId`)
  - **Rate Limiting**: (Not currently enforced — FIXME)
  - **GraphQL Query Complexity**: (Not currently enforced — FIXME)

### Backend → Database (PostgreSQL/Redis/ClickHouse)
- **Boundary**: NestJS process → PostgreSQL/Redis/ClickHouse
- **Threats**: SQL injection, data leakage across workspaces, credential theft
- **Controls**:
  - **Parameterized Queries**: TypeORM uses prepared statements (no raw SQL in user inputs)
  - **Schema Isolation**: Each workspace has its own PostgreSQL schema (e.g., `workspace_abc123`)
  - **Connection Pooling**: Limits concurrent connections
  - **Encrypted Connections**: TLS for PostgreSQL (if `sslmode=require` in connection string)

### Backend → External Services (OAuth Providers, Email Servers, S3)
- **Boundary**: NestJS → Google/Microsoft OAuth, SMTP servers, AWS S3
- **Threats**: Token leakage, MITM, malicious redirects
- **Controls**:
  - **HTTPS**: All external API calls use TLS
  - **OAuth State Parameter**: Prevents CSRF in OAuth flow (`passport-google-oauth20`)
  - **Redirect URI Validation**: OAuth callbacks only to allowed `AUTH_GOOGLE_CALLBACK_URL`
  - **S3 Pre-Signed URLs**: Temporary, scoped file upload/download URLs

### Worker Queue (BullMQ) → Backend Services
- **Boundary**: Queue worker process → Redis (job queue) → Database
- **Threats**: Job injection, privilege escalation via job payloads
- **Controls**:
  - **Redis Authentication**: Password-protected Redis (if `REDIS_URL` includes password)
  - **Job Payload Validation**: Workers validate job data before processing
  - **Idempotency**: Jobs designed to be safely retried

### Admin/Metadata API → Workspace Data
- **Boundary**: `/metadata` GraphQL endpoint → Schema modifications
- **Threats**: Malicious schema changes (delete fields, break relations)
- **Controls**:
  - **Admin-Only Permissions**: Metadata mutations require workspace admin role
  - **Schema Validation**: Custom object/field definitions validated before applying

## Threat Model

### T1: Account Takeover
- **Attack**: Attacker steals JWT token (e.g., XSS, malware)
- **Impact**: Full access to workspace data
- **Mitigations**:
  - **JWT Expiry**: Tokens expire after 1 hour (refresh flow TBD)
  - **HttpOnly Cookies**: Session cookies inaccessible to JavaScript (mitigates XSS)
  - **Secure Flag**: Cookies only sent over HTTPS
  - **CSP**: Blocks inline scripts, limits XSS impact

### T2: SQL Injection
- **Attack**: Malicious input in GraphQL args → raw SQL execution
- **Impact**: Data breach, database manipulation
- **Mitigations**:
  - **TypeORM Parameterization**: All queries use placeholders (`WHERE name = ?`)
  - **GraphQL Input Validation**: Zod schemas validate mutation inputs
  - **No Dynamic SQL**: Avoid `queryBuilder.where(userInput)` without sanitization

### T3: Workspace Data Leakage (Multi-Tenancy)
- **Attack**: User A queries User B's workspace data
- **Impact**: Cross-workspace data breach
- **Mitigations**:
  - **Workspace Middleware**: `WorkspaceAuthContextMiddleware` injects `workspaceId` into request
  - **Schema Isolation**: PostgreSQL schemas prevent accidental cross-workspace queries
  - **Query Filters**: TypeORM queries auto-scoped to `request.workspace.id`

### T4: File Upload Exploits
- **Attack**: Upload malicious file (e.g., PHP shell, XSS HTML)
- **Impact**: RCE on server, XSS when file rendered
- **Mitigations**:
  - **File Type Validation**: Check MIME type and magic bytes (`file-type` npm package)
  - **Virus Scanning**: (Not implemented — FIXME for production)
  - **S3 Storage**: Files served from S3 with separate domain (no cookie access)
  - **Content-Disposition**: Force download instead of inline rendering

### T5: Denial of Service (DoS)
- **Attack**: Expensive GraphQL query (e.g., deep nesting, huge pagination)
- **Impact**: Server CPU/memory exhaustion
- **Mitigations**:
  - **Query Complexity Limit**: (Not enforced — FIXME)
  - **Pagination Limits**: Default page size = 50, max = 1000
  - **Timeout**: HTTP requests timeout after 30s (configurable in NestJS)

### T6: Dependency Vulnerabilities
- **Attack**: Exploit known CVE in npm package (e.g., prototype pollution)
- **Impact**: RCE, data breach
- **Mitigations**:
  - **Dependabot**: Automated PR for dependency updates (`.github/dependabot.yml`)
  - **Yarn Audit**: (Should run in CI — FIXME)
  - **Pin Exact Versions**: `yarn.lock` ensures reproducible builds

### T7: Secrets Leakage in Logs/Errors
- **Attack**: Secrets logged in error messages, sent to Sentry
- **Impact**: API keys exposed to monitoring tools
- **Mitigations**:
  - **Sentry Scrubbing**: Configure `beforeSend` to redact secrets
  - **Environment Variable Logging**: Avoid logging `process.env` directly
  - **Error Messages**: Never echo user-controlled input in error responses

### T8: OAuth Redirect Hijacking
- **Attack**: Manipulate `redirect_uri` to steal authorization code
- **Impact**: Account takeover via OAuth flow
- **Mitigations**:
  - **Strict Redirect URI Validation**: `AUTH_GOOGLE_CALLBACK_URL` hardcoded in Passport strategy
  - **State Parameter**: Random nonce prevents CSRF

### T9: Webhook Replay Attacks
- **Attack**: Replay legitimate webhook payload to trigger duplicate actions
- **Impact**: Duplicate emails, Slack messages, data corruption
- **Mitigations**:
  - **Webhook Signatures**: (Not enforced — FIXME)
  - **Idempotency Keys**: (Not enforced — FIXME)
  - **Timestamp Validation**: Reject old payloads (e.g., >5 min old)

### T10: Privilege Escalation
- **Attack**: Regular user modifies schema to grant themselves admin permissions
- **Impact**: Unauthorized access to sensitive data
- **Mitigations**:
  - **Role-Based Access Control (RBAC)**: Permissions checked in resolvers
  - **Immutable System Roles**: Cannot delete or modify built-in "admin" role
  - **Audit Logs**: (Not implemented — FIXME for compliance)

## Security Requirements

### HARD CONSTRAINTS (FORGE Must Satisfy)

#### 1. **Authentication & Authorization**
- **Req-1.1**: All `/graphql`, `/metadata`, `/rest/*` endpoints MUST require valid JWT (except public signup/login)
- **Req-1.2**: Mutations MUST check user permissions via `@WorkspaceAuth()` decorator before executing
- **Req-1.3**: Admin-only operations (metadata changes, user management) MUST verify `isAdmin` role
- **Req-1.4**: JWT tokens MUST expire within 24 hours (configurable via `ACCESS_TOKEN_EXPIRES_IN`)

#### 2. **Input Validation**
- **Req-2.1**: All GraphQL mutation inputs MUST be validated with Zod schemas
- **Req-2.2**: Custom field values MUST match declared type (e.g., email field validates email format)
- **Req-2.3**: File uploads MUST validate: file size (≤100MB), MIME type (whitelist), extension
- **Req-2.4**: GraphQL query depth MUST NOT exceed 10 levels (prevent DoS)

#### 3. **Data Isolation**
- **Req-3.1**: Database queries MUST be scoped to `request.workspace.id` (no cross-workspace leaks)
- **Req-3.2**: File uploads MUST be stored in workspace-specific S3 prefix or directory
- **Req-3.3**: Cache keys (Redis) MUST include workspace ID to prevent cache poisoning

#### 4. **Secrets Management**
- **Req-4.1**: `APP_SECRET`, `PG_DATABASE_URL`, OAuth secrets MUST be loaded from environment variables (never hardcoded)
- **Req-4.2**: Secrets MUST NOT be logged (error messages, Sentry, console output)
- **Req-4.3**: User-facing API responses MUST NOT include internal error details (use generic "Internal Server Error")

#### 5. **Transport Security**
- **Req-5.1**: Production deployments MUST enforce HTTPS (no HTTP)
- **Req-5.2**: Session cookies MUST have `Secure` and `HttpOnly` flags
- **Req-5.3**: Database connections SHOULD use TLS (`sslmode=require` in PostgreSQL URL)

#### 6. **Dependencies**
- **Req-6.1**: No dependencies with known critical CVEs (CVSS ≥9.0) unless patched or mitigated
- **Req-6.2**: Dependency updates MUST be tested before merging (CI runs full test suite)

#### 7. **Audit & Monitoring**
- **Req-7.1**: Failed login attempts MUST be logged (for brute-force detection)
- **Req-7.2**: Metadata changes (create object, delete field) MUST be logged (for compliance audits)
- **Req-7.3**: Unhandled exceptions MUST be sent to Sentry with sanitized context (no secrets)

## Security Checklist

**SENTINEL runs these checks on every PR:**

### Code Review Checks (Automated)
- [ ] **No Hardcoded Secrets**: Grep for `password`, `secret`, `api_key` in committed files (exclude `.env.example`)
- [ ] **No SQL Injection**: Confirm all database queries use TypeORM query builders or parameterized queries
- [ ] **Input Validation**: All mutation DTOs have `class-validator` decorators or Zod schemas
- [ ] **Auth Decorators**: All non-public GraphQL resolvers have `@WorkspaceAuth()` or `@PublicApi()`
- [ ] **File Upload Checks**: File upload handlers call `validateFileType()` and check size limits
- [ ] **Error Sanitization**: GraphQL errors do not leak stack traces or internal paths (use `UnhandledExceptionFilter`)

### Dependency Checks (Automated)
- [ ] **No Critical CVEs**: `yarn audit` reports zero critical vulnerabilities
- [ ] **License Compliance**: All dependencies have OSI-approved licenses (no proprietary/restrictive)
- [ ] **Dependency Pinning**: `yarn.lock` present and matches `package.json`

### Configuration Checks (Automated)
- [ ] **Environment Variables**: All required secrets in `.env.example` are documented
- [ ] **CSP Headers**: Content-Security-Policy set in production (check Nginx/Helmet config)
- [ ] **Cookie Security**: Session cookies have `Secure`, `HttpOnly`, `SameSite=Strict` flags
- [ ] **CORS**: CORS allowed origins whitelist excludes `*` in production

### Manual Review (SENTINEL Alerts for Human Review)
- [ ] **Privilege Escalation**: Any changes to `roles`, `permissions`, `isAdmin` logic reviewed by security lead
- [ ] **Schema Migrations**: Database migrations do not expose PII in column names or logs
- [ ] **OAuth Flows**: Changes to Passport strategies reviewed for redirect URI validation
- [ ] **Webhook Handling**: Outbound webhook handlers validate HTTPS URLs, prevent SSRF

### Pre-Deployment Checks (Production Only)
- [ ] **TLS Certificate Valid**: HTTPS cert not expired, trusted CA
- [ ] **Secrets Rotation**: `APP_SECRET` changed from default example value
- [ ] **Database Backups**: Automated backups enabled (hourly snapshots)
- [ ] **Rate Limiting**: Reverse proxy (Nginx/CloudFlare) enforces rate limits (100 req/min per IP)
- [ ] **Firewall Rules**: PostgreSQL/Redis/ClickHouse ports not exposed to public internet

---

**Security Contact**: Report vulnerabilities to `security@twenty.com` (confidential). Do not open public GitHub issues for security bugs.
