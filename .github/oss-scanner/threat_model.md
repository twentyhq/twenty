# Threat model

## What this project does
Twenty is an open-source, multi-tenant CRM. It runs as a cloud service (twenty.com) and is self-hosted by many
organizations, usually exposed to the internet. It stores business data (people, companies, deals, notes), synced
emails and calendar events, files, and credentials for connected Google, Microsoft and IMAP/SMTP/CalDAV accounts.

- `packages/twenty-server`: NestJS + TypeORM + PostgreSQL + Redis, BullMQ workers. Each workspace has its own Postgres
  schema; instance-wide tables live in the `core` schema. The workspace schema and the GraphQL schema are generated
  from per-workspace metadata (custom objects and fields).
- `packages/twenty-front`: React app.
- `packages/twenty-shared`: types and utils shared by front and server.
- `packages/twenty-sdk`, `packages/twenty-front-component-renderer`: the third-party application platform (see below).

Paths below are relative to `packages/twenty-server/src/` unless stated otherwise.

## Where untrusted input enters
- **APIs** (`engine/api/`): the GraphQL core API (`/graphql`, workspace records), the GraphQL metadata API
  (`/metadata`, objects, fields, views, roles, settings), REST (`/rest`, `/rest/metadata`), and MCP (`/mcp`). They
  share the same query runners and ORM permission layer.
- **Public endpoints**, each with its own authenticity check and nothing else: Stripe and email-provider webhooks
  (signature over the raw body), Google/Microsoft sync webhooks (channel token), workflow webhook triggers, application
  route triggers and server route triggers, OAuth endpoints for apps (token, dynamic client registration,
  discovery), SSO callbacks, sign-in/sign-up mutations, invitation and password-reset links, email unsubscribe and
  campaign tracking, `/files`, `/.well-known/*`.
- **Synced external content**: email bodies, headers, attachments and calendar events from Gmail, Microsoft and IMAP
  are written by anyone who can email a user. They are stored and rendered in the front end, and read by AI agents.
- **Workspace-defined content**: rich text, record fields, workflow definitions (Handlebars templates rendered from
  the run context), webhook targets, agent prompts and skills, uploaded files (SVG and HTML are accepted).
- **Application packages**: a third-party app ships `manifest.json`, `package.json`, a lockfile and built bundles. On
  install, the manifest is applied as a metadata migration (objects, fields, roles, views, logic functions, front
  components, agents) and install hooks run.

## Auth shape
- Tokens are issued in `engine/core-modules/auth/token/services/` (access, refresh, login, transient, file, file
  upload, API key, application access/refresh) and verified in `engine/core-modules/jwt/`. The auth context identifies
  one of four principals: user, API key, application (with or without a user), or system.
- Guards in `engine/guards/`. `AuthPrincipalGuard` on each resolver/controller lists the principal kinds it admits.
  `SettingsPermissionGuard(flag)` checks a permission flag on the caller's role. `ApplicationTargetGuard` confines an
  application token to its own application. `AdminPanelGuard` and the impersonation guards gate instance-admin
  actions. `PublicEndpointGuard`, `NoPermissionGuard` and `CustomPermissionGuard` are labels that always allow: the
  real check is in the handler.
- Record-level authorization is not in resolvers. Object, field and row-level permissions are enforced inside
  `engine/twenty-orm/` from the role(s) resolved from the auth context. `shouldBypassPermissionChecks` and the system
  auth context turn them off. GraphQL, REST, MCP and AI tools all depend on this layer.
- An application token's role is the application's default role, intersected with the user's role when the token
  carries a user. API keys have their own role.

## Trust boundaries and invariants, most important first
1. **Workspace isolation.** No principal of workspace A may read or modify data, metadata, files, tokens, chat
   history or jobs of workspace B. Watch for core-table lookups keyed only by a caller-supplied id, queries that do
   not go through the workspace data source, and caller-reachable paths that run with
   `shouldBypassPermissionChecks` or a system context.
2. **Authentication and sessions.** No login as another user, no bypass of 2FA or SSO enforcement, no account
   takeover via reset, invitation, email verification or OAuth/SSO flows. Revoked sessions and changed passwords must
   invalidate tokens. Each token kind must only be accepted where intended (token type confusion is a subtle failure
   mode). Impersonation must be re-validated on every request.
3. **Authorization inside a workspace.** A member must not read or write records or fields their role denies, change
   their own role, or reach a settings action without its permission flag. API keys, application tokens and OAuth
   clients must never get more than their role (intersected with the user's role when acting for one).
4. **Code execution.** Logic functions, workflow code steps and app install hooks are user- or publisher-written
   code. In production they run in the `LAMBDA` driver; the AI code interpreter runs in `E2B`. That code must not
   reach the server process, its environment, another workspace's files or dependency layers, or a token wider than
   its own application in its own workspace.
5. **Application platform.** A malicious app publisher controls every manifest value and bundle. App runtime APIs
   (key-value, jobs, connections, billing, message channels, SDK client, public domains) must act only on the calling
   application's own rows in its own workspace. Instance-wide registration trust flags must change only through
   instance-admin paths. Front components run in a sandboxed iframe plus a Worker; they must not escape into the
   Twenty origin or call host APIs as the viewing user beyond what the bridge allows.
6. **AI agents, chat and MCP.** The model reads attacker-controlled content (emails, records, files, tool output),
   so assume prompt injection. The property to hold is that no tool grants more than the executing principal's role,
   checked at call time, and that nothing in an agent run, workflow step, trigger or deferred tool call widens that
   role or changes whose identity a write is attributed to.
7. **Injection.** SQL injection through filters, ordering, search, aggregates, or metadata-driven DDL (object and
   field names become table and column names). Template injection in workflow Handlebars rendering. Stored XSS in the
   front end from email bodies, rich text, record fields, link fields, AI Markdown output, or uploaded SVG/HTML served
   from `/files`.
8. **Outbound requests.** Webhooks, workflow HTTP steps, the AI HTTP tool, IMAP/SMTP/CalDAV settings and other
   user-supplied URLs must go through `SecureHttpClientService`, which blocks private and link-local addresses unless
   `OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS` allows them. SSRF into cloud metadata or internal services is in scope.
9. **Secrets at rest.** Connected-account OAuth tokens, IMAP/SMTP/CalDAV credentials and application variables are
   encrypted by `SecretEncryptionService`. Paths that return, log, export or send plaintext to someone other than the
   owner are in scope.
10. **Files.** Workspace files are served with a file token bound to a workspace and file id within an allowlisted
    set of folders. Path traversal, cross-workspace file access, and file tokens usable beyond their file are in scope.

## Out of scope / known false positives
- `packages/twenty-website`, `packages/twenty-docs`, `packages/twenty-e2e-testing`, `packages/twenty-apps` (example and
  internal apps), `packages/twenty-zapier`, `packages/twenty-utils`, `packages/twenty-docker`, storybook, tests and
  test helpers (`packages/twenty-server/test/`), dev seed data (`engine/workspace-manager/dev-seeder`), and their
  placeholder secrets.
- The `LOCAL` logic-function driver and the `LOCAL` code-interpreter driver run code on the server host. They are
  development only (the code interpreter refuses `LOCAL` in production). Report escapes from `LAMBDA` or `E2B`, not
  from `LOCAL`.
- Instance admins (admin panel, impersonation) and anyone who controls environment variables or the database are
  trusted. The admin panel reads across workspaces by design. Upgrade commands under
  `database/commands/upgrade-version-command/` run across workspaces from the CLI by design.
- `/healthz`, `/client-config`, `/open-api/*`, `/.well-known/*` and public marketplace queries are unauthenticated by
  design; report only what they leak, not that they are public.
- `PublicEndpointGuard`, `NoPermissionGuard`, `CustomPermissionGuard` on their own are not findings; judge what the
  handler does.
- Server-scoped app key-value and server route dispatch are shared across the workspaces that installed the same app
  registration, by design of the publisher model.
- Issues that need an insecure configuration set on purpose (for example allowing all internal hosts), missing rate
  limiting, missing security headers, user enumeration without further impact, and self-XSS.
- Vulnerabilities that live entirely in third-party dependencies, unless Twenty's own code makes them reachable.

## How to exercise it
- The image has Postgres 18 and Redis. Start them with `service postgresql start && service redis-server start`.
- The dev database is seeded with two workspaces, Apple and YCombinator. Users `tim@apple.dev`,
  `jony.ive@apple.dev`, `phil.schiler@apple.dev` and `jane.austen@apple.dev` belong to both;
  `scott.forstall@apple.dev` belongs only to Apple. All have the password `tim@apple.dev`. Roles differ per user
  (admin, member, guest), which makes them useful for permission and isolation tests.
- Start the server with `npx nx start twenty-server` (port 3000) and the worker with `npx nx run twenty-server:worker`.
- Unit tests: `npx nx test twenty-server`, `npx nx test twenty-front`, `npx nx test twenty-shared`.
- Integration tests boot their own server against the `test` database:
  `npx nx run twenty-server:test:integration:with-db-reset`. Tokens for admin, member, guest and API-key principals
  are in `packages/twenty-server/test/integration/constants/test-tokens.json`, and `test/integration/` shows how to
  make authenticated GraphQL, metadata and REST requests. This is the easiest way to write a proof of concept for
  permission or isolation bugs.

## How we rate severity
- Critical: cross-workspace read or write of data, metadata, files, credentials or tokens; unauthenticated remote
  code execution; authentication bypass or account takeover with no victim interaction.
- High: escape from the `LAMBDA` or `E2B` sandbox or from a front-component sandbox; authenticated remote code
  execution on the server; privilege escalation to workspace admin; bypass of object, field or row-level permissions;
  account takeover that needs one victim click; SQL injection reachable by any workspace member; SSRF reaching cloud
  metadata or internal services; stored XSS triggered by an inbound email or by content any member can write and
  executed in another user's session; an AI tool, agent or MCP call acting beyond its principal's role.
- Medium: stored XSS that needs an admin to write the payload; bypass of a settings permission flag with limited
  impact; information disclosure of non-sensitive metadata across roles; plaintext secrets exposed to the same
  workspace's admins; denial of service of the whole server from a single authenticated request.
- Low: issues that need an instance admin or an insecure configuration, open redirects, minor information leaks.

## Reports
- Include a proof of concept against the code in this image: ideally an integration test under
  `packages/twenty-server/test/integration`, otherwise a sequence of HTTP requests against the seeded server.
- Proposed patches should be minimal and follow the surrounding code.
- Deduplicate by root cause: one report per missing or broken check, listing every endpoint it affects.
