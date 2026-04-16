# Security Context - Twenty CRM

## Sensitive Data Inventory

### Critical Secrets (Must Never Leak)
- **APP_SECRET**: Encryption key for JWT signing, session tokens, password reset tokens
- **Database credentials**: `PG_DATABASE_URL` (postgres://user:pass@host:port/db)
- **Redis credentials**: `REDIS_URL` (redis://[user:pass@]host:port)
- **OAuth client secrets**: `AUTH_GOOGLE_CLIENT_SECRET`, `AUTH_MICROSOFT_CLIENT_SECRET`
- **API keys**: `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `SENTRY_DSN`, `STRIPE_API_KEY`
- **SMTP credentials**: `EMAIL_SMTP_USER`, `EMAIL_SMTP_PASSWORD`
- **S3 credentials**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- **SAML private keys**: `SSL_KEY_PATH` contents
- **Enterprise license key**: `ENTERPRISE_KEY`
- **Cloudflare webhook secret**: `CLOUDFLARE_WEBHOOK_SECRET`

### High-Sensitivity User Data
- **Passwords**: Hashed with bcrypt (cost factor 10), stored in `core.user` table
- **Access tokens**: JWT with expiration (default 30m), refresh tokens (90d)
- **OAuth tokens**: Google/Microsoft access/refresh tokens for email/calendar sync
- **SAML assertions**: Single sign-on session data
- **2FA secrets**: OTP secrets (otplib), recovery codes
- **Session data**: Redis-backed express-session, contains userId, workspaceId

### Business-Critical Data
- **Customer records**: All data in workspace-specific schemas (`workspace_*`)
- **Custom object data**: User-defined objects with arbitrary fields (JSONB support)
- **File attachments**: S3 objects referenced in database, presigned URLs for access
- **Email content**: Synced from Gmail/Microsoft, stored in workspace schema
- **Calendar events**: Synced from Google/Microsoft Calendar
- **Workflow definitions**: Automation logic, may contain HTTP endpoint URLs, API keys in config
- **AI conversation history**: Prompts/responses stored for audit, may contain sensitive context

### Compliance-Relevant Metadata
- **Audit logs**: Activity timeline (who created/updated/deleted records, when)
- **User PII**: Email addresses, names, profile photos
- **Workspace metadata**: Company names, billing info (if enabled)
- **API usage logs**: Request logs with IP addresses, user agents
- **Error logs**: Sentry events may contain stack traces with sensitive data fragments

## Trust Boundaries

### External → Frontend (Browser)
- **Entry Points**: `https://frontend-domain` (served via Nginx/CDN in production)
- **Authentication**: None initially, redirects to `/auth/login`
- **Threats**: XSS, CSRF, clickjacking, malicious file uploads
- **Mitigations**:
  - CSP headers (Content Security Policy)
  - X-Frame-Options: DENY
  - Strict SameSite cookies
  - Input sanitization before rendering (DOMPurify for rich text)

### Frontend → Backend API (GraphQL/REST)
- **Entry Points**: `https://api-domain/graphql`, `/rest/*`, `/auth/*`
- **Authentication**: JWT access token in Authorization header (`Bearer <token>`)
- **Threats**: Token theft, replay attacks, unauthorized API access, GraphQL injection
- **Mitigations**:
  - JWT expiration (30m), refresh token rotation (90d)
  - CORS restricted to `FRONTEND_URL`
  - Rate limiting (`API_RATE_LIMITING_TTL`, `API_RATE_LIMITING_LIMIT`)
  - Query complexity analysis (max depth, max fields)
  - GraphQL introspection disabled in production (optional)

### Backend → Database (PostgreSQL)
- **Entry Points**: `PG_DATABASE_URL` connection from NestJS server
- **Authentication**: Username/password in connection string, optional SSL (`PG_SSL_ALLOW_SELF_SIGNED`)
- **Threats**: SQL injection, unauthorized schema access, privilege escalation
- **Mitigations**:
  - TypeORM parameterized queries (prevents SQL injection)
  - Workspace-scoped queries (automatic schema prefix)
  - Database user with limited permissions (no DROP DATABASE, no superuser)
  - Connection pooling with max connection limits

### Backend → Redis (Cache/Sessions)
- **Entry Points**: `REDIS_URL` connection from NestJS server, BullMQ workers
- **Authentication**: Optional password in connection string
- **Threats**: Session hijacking, cache poisoning, unauthorized job injection
- **Mitigations**:
  - Redis AUTH enabled in production
  - Session cookies with httpOnly, secure, sameSite flags
  - Job queue isolation per workspace (key prefixes)
  - TLS for Redis connections in production

### Backend → External APIs (OAuth, AI, Email)
- **Entry Points**: `googleapis.com`, `graph.microsoft.com`, `api.openai.com`, SMTP servers
- **Authentication**: OAuth tokens (Google/Microsoft), API keys (AI providers), SMTP credentials
- **Threats**: Token leakage, man-in-the-middle attacks, API key exhaustion/abuse
- **Mitigations**:
  - OAuth tokens encrypted at rest (APP_SECRET as key)
  - TLS 1.2+ for all external API calls
  - axios-retry for transient failures (prevents retry storms)
  - API key rotation via Admin Panel (Config Variables)
  - Rate limiting on AI calls to prevent abuse

### Backend → S3 (File Storage)
- **Entry Points**: `AWS_S3_ENDPOINT_URL` or AWS default endpoints
- **Authentication**: AWS IAM credentials or access key/secret
- **Threats**: Unauthorized file access, bucket enumeration, public write access
- **Mitigations**:
  - Presigned URLs with expiration (default 1d via `FILE_TOKEN_EXPIRES_IN`)
  - Bucket policies enforce private access (no public read)
  - File type validation (`file-type` library, not just MIME sniffing)
  - Virus scanning (optional, via ClamAV or cloud service)

### User → User (Workspace Collaboration)
- **Entry Points**: Shared records, mentions, comments
- **Authentication**: Workspace membership + role-based permissions
- **Threats**: Privilege escalation, data exfiltration, malicious workflow injection
- **Mitigations**:
  - Role-based access control (Admin, Member, Viewer + custom roles)
  - Object-level permissions (per-object CRUD grants)
  - Field-level permissions (hide sensitive fields from non-admins)
  - Workflow execution sandboxing (HTTP actions in safe mode by default)

## Threat Model

### 1. Authentication & Authorization Threats

#### T1.1: Password Brute Force
- **Attack Vector**: Automated login attempts with common passwords
- **Likelihood**: High (public internet exposure)
- **Impact**: Account takeover, data breach
- **Mitigations**:
  - Bcrypt with cost factor 10 (slow hashing)
  - Rate limiting on `/auth/login` (default: configurable via `API_RATE_LIMITING_*`)
  - CAPTCHA support (`CAPTCHA_DRIVER`, `CAPTCHA_SITE_KEY`)
  - Account lockout after N failed attempts (future enhancement)

#### T1.2: JWT Token Theft
- **Attack Vector**: XSS steals token from localStorage/memory, MitM intercepts unencrypted request
- **Likelihood**: Medium (requires XSS or network compromise)
- **Impact**: Session hijacking, API abuse
- **Mitigations**:
  - Short-lived access tokens (30m)
  - Refresh token rotation (invalidate old on use)
  - httpOnly cookies for refresh tokens (not accessible to JS)
  - TLS enforced in production (HTTPS only)

#### T1.3: OAuth Flow Manipulation
- **Attack Vector**: Redirect URI manipulation, authorization code interception
- **Likelihood**: Medium (requires phishing or DNS hijacking)
- **Impact**: Account takeover via Google/Microsoft login
- **Mitigations**:
  - Strict redirect URI whitelist (`AUTH_GOOGLE_CALLBACK_URL`)
  - State parameter validation (CSRF protection)
  - Use authorization code flow (not implicit flow)
  - Verify OAuth tokens with provider before trusting

### 2. Data Access Threats

#### T2.1: Multi-Tenant Data Leakage
- **Attack Vector**: Workspace ID manipulation in GraphQL queries, schema confusion
- **Likelihood**: High (common multi-tenant vulnerability)
- **Impact**: Critical — access to other customers' data
- **Mitigations**:
  - Workspace context injected at middleware level (not user-controllable)
  - TypeORM automatically scopes queries to workspace schema
  - GraphQL resolvers enforce workspace membership check
  - Integration tests validate tenant isolation

#### T2.2: GraphQL Injection
- **Attack Vector**: Malicious field names, deep query nesting, circular references
- **Likelihood**: Medium (requires understanding GraphQL schema)
- **Impact**: DoS via query complexity, data exfiltration via introspection
- **Mitigations**:
  - Query depth limiting (max 10 levels)
  - Query complexity analysis (cost-based)
  - Introspection disabled in production (optional via config)
  - Field-level permissions prevent unauthorized field access

#### T2.3: Insecure Direct Object Reference (IDOR)
- **Attack Vector**: Guess record IDs, manipulate object metadata IDs
- **Likelihood**: High (UUIDs reduce guessability but don't eliminate risk)
- **Impact**: Access to records in same workspace but restricted by permissions
- **Mitigations**:
  - UUIDs for all record IDs (not sequential integers)
  - Permission checks on every query/mutation (object-level + field-level)
  - GraphQL DataLoader caches permission results (prevents N+1 auth checks)

### 3. Injection Threats

#### T3.1: SQL Injection
- **Attack Vector**: User input in dynamic queries, ORM bypass
- **Likelihood**: Low (TypeORM uses parameterized queries)
- **Impact**: Critical — database compromise, data exfiltration
- **Mitigations**:
  - TypeORM query builder (never string concatenation for SQL)
  - Raw queries use parameterized bindings (`query($1, $2)`)
  - Input validation at GraphQL schema level (types, regex)

#### T3.2: Cross-Site Scripting (XSS)
- **Attack Vector**: Unescaped user input in rich text, record names, custom fields
- **Likelihood**: High (rich text editor, file uploads)
- **Impact**: Session hijacking, phishing, malware distribution
- **Mitigations**:
  - React escapes by default (no `dangerouslySetInnerHTML` without sanitization)
  - DOMPurify sanitizes rich text before rendering
  - CSP headers block inline scripts (`script-src 'self'`)
  - File upload content-type validation (no HTML files as attachments)

#### T3.3: Command Injection (Workflow Actions)
- **Attack Vector**: HTTP action URLs with unsanitized user input, code interpreter abuse
- **Likelihood**: Medium (workflows allow HTTP requests, code execution)
- **Impact**: SSRF, RCE on server, data exfiltration
- **Mitigations**:
  - HTTP_TOOL_SAFE_MODE_ENABLED (default true) blocks private IPs
  - Allowlist for external request domains (optional)
  - Code interpreter sandboxed via E2B (@e2b/code-interpreter)
  - Workflow execution logs audited (who triggered, what data sent)

### 4. Availability Threats

#### T4.1: Denial of Service (DoS)
- **Attack Vector**: High-volume API requests, expensive GraphQL queries, large file uploads
- **Likelihood**: High (public API exposure)
- **Impact**: Service unavailable, increased costs
- **Mitigations**:
  - Rate limiting per IP/user (`API_RATE_LIMITING_TTL`, `API_RATE_LIMITING_LIMIT`)
  - Query complexity limits (reject queries over threshold)
  - File upload size limits (configurable, default 10MB)
  - BullMQ job queue prevents worker overload (concurrency limits)

#### T4.2: Resource Exhaustion (Database)
- **Attack Vector**: Create millions of records, complex joins, unindexed queries
- **Likelihood**: Medium (requires authenticated user)
- **Impact**: Database slowdown, cascading failures
- **Mitigations**:
  - `MUTATION_MAXIMUM_AFFECTED_RECORDS=100` (bulk update limit)
  - Pagination enforced on list queries (max 100 per page)
  - Database query timeout (30s default)
  - Connection pooling prevents connection exhaustion

### 5. Supply Chain Threats

#### T5.1: Dependency Vulnerabilities
- **Attack Vector**: npm packages with CVEs, malicious package updates
- **Likelihood**: Medium (600+ dependencies)
- **Impact**: RCE, data exfiltration, backdoor
- **Mitigations**:
  - Dependabot enabled (automatic PRs for security updates)
  - Yarn 4 integrity checks (lockfile checksums)
  - Regular `yarn audit` in CI
  - Patch risky dependencies (e.g., `typeorm+0.3.20.patch`)

#### T5.2: Malicious Contributions
- **Attack Vector**: PR with backdoor, typosquatting in package.json
- **Likelihood**: Low (code review required)
- **Impact**: Critical — full system compromise
- **Mitigations**:
  - Required PR reviews (CODEOWNERS file)
  - CI runs all tests, linting, type checking before merge
  - Danger bot checks for todos, large diffs
  - Community audits (open-source transparency)

## Security Requirements

### Hard Constraints (FORGE Must Satisfy)

1. **Authentication**
   - All API endpoints except `/healthz`, `/auth/login`, `/auth/signup` require valid JWT
   - Passwords hashed with bcrypt (min cost 10)
   - OAuth tokens encrypted at rest with APP_SECRET
   - 2FA codes validated with time window (30s)

2. **Authorization**
   - Every GraphQL resolver checks workspace membership
   - Every mutation validates user has required permission (object-level + field-level)
   - Workspace schema isolation enforced at TypeORM level (no cross-workspace queries)
   - Admin-only actions (workspace deletion, user management) require `isAdmin: true`

3. **Input Validation**
   - All user input validated against GraphQL schema types
   - Email addresses validated with regex + DNS check (optional)
   - File uploads validated by magic bytes, not MIME type
   - Rich text sanitized with DOMPurify before storage and rendering
   - URLs in workflow actions validated (no `file://`, `javascript:` schemes)

4. **Data Protection**
   - Database credentials never logged or sent to frontend
   - API keys never returned in GraphQL queries (write-only fields)
   - Presigned S3 URLs expire within `FILE_TOKEN_EXPIRES_IN` (default 1d)
   - Session cookies use `httpOnly: true`, `secure: true` (HTTPS), `sameSite: strict`

5. **Error Handling**
   - Database errors sanitized (no raw SQL in responses)
   - Stack traces hidden in production (Sentry only)
   - Generic error messages to users ("An error occurred"), detailed logs to server
   - No user enumeration (same error for "user not found" and "wrong password")

6. **Cryptography**
   - TLS 1.2+ for all external API calls
   - AES-256 for encrypting OAuth tokens at rest (future: field-level encryption)
   - Random token generation via crypto.randomBytes (not Math.random)
   - JWT signed with HS256 (future: RS256 for multi-region)

## Security Checklist

SENTINEL must verify these on every PR:

### Authentication & Session Management
- [ ] No hardcoded credentials in code (APP_SECRET, API keys, passwords)
- [ ] No passwords logged (search for `console.log`, `logger.log` near password variables)
- [ ] JWT expiration set (`ACCESS_TOKEN_EXPIRES_IN`, `REFRESH_TOKEN_EXPIRES_IN`)
- [ ] Session cookies have `httpOnly`, `secure`, `sameSite` flags

### Authorization & Access Control
- [ ] New GraphQL resolvers check `workspaceId` matches authenticated user's workspace
- [ ] New mutations validate permissions (`@AuthWorkspace()`, `@Authorize()` decorators)
- [ ] New custom roles include permission definitions
- [ ] No database queries bypass workspace schema isolation

### Input Validation & Sanitization
- [ ] User input validated against schema (GraphQL types, class-validator)
- [ ] Rich text sanitized with DOMPurify before rendering (`dangerouslySetInnerHTML`)
- [ ] File uploads validate content type via `file-type` library (not just extension)
- [ ] URLs in workflow actions validated (no `javascript:`, `data:`, `file:` schemes)

### SQL Injection Prevention
- [ ] No raw SQL queries with string concatenation
- [ ] TypeORM query builder or parameterized queries (`query($1, $2)`)
- [ ] Dynamic table/column names validated against allowlist

### XSS Prevention
- [ ] No `dangerouslySetInnerHTML` without DOMPurify
- [ ] React props escaped by default (no `{...props}` on DOM elements without validation)
- [ ] CSP headers defined for new routes (if adding new HTML pages)

### CSRF Prevention
- [ ] State-changing endpoints require POST/PUT/DELETE (not GET)
- [ ] GraphQL mutations not executable via GET
- [ ] CORS restricted to `FRONTEND_URL`

### Secrets Management
- [ ] No secrets in frontend code (check `twenty-front/src/`)
- [ ] Environment variables loaded from `.env`, not hardcoded
- [ ] New secrets documented in `.env.example`

### Data Exposure
- [ ] API responses do not leak internal IDs, stack traces, SQL queries
- [ ] Error messages generic to users, detailed to logs only
- [ ] No PII in public logs (Sentry events scrubbed)

### Dependency Security
- [ ] New dependencies have recent updates (not abandoned)
- [ ] No known CVEs in new dependencies (run `yarn audit`)
- [ ] Patches applied if CVE found in existing dependency

### Rate Limiting & DoS
- [ ] New API endpoints respect rate limiting middleware
- [ ] Bulk mutations respect `MUTATION_MAXIMUM_AFFECTED_RECORDS`
- [ ] File uploads respect size limits

### Logging & Monitoring
- [ ] Security events logged (login, permission denied, data export)
- [ ] No sensitive data in logs (passwords, tokens, PII)
- [ ] Sentry configured with `beforeSend` to scrub secrets
