# XO Pure CRM Knowledge Base

Last audited: 2026-05-07

## Executive Summary

The installed application at `/Users/brians/Documents/xopure_crm/Xopure_crm` is a full upstream Twenty CRM monorepo. It is not currently a custom XO Pure CRM fork yet; it provides the CRM platform, APIs, data model engine, workflow engine, app SDK, frontend, backend, worker, Docker/self-hosting assets, docs, SDKs, and examples needed to build one.

The additions folder at `/Users/brians/Downloads/crm_xopure_additions` is an infrastructure package named `xopure-twenty-infra`. It does not contain customer or ambassador sync business logic. It contains Railway deployment definitions, Cloudflare R2 backup scripts, environment documentation, and a runbook for operating Twenty at `crm.xopure.com`.

Target state: Twenty runs as the operational CRM for XO Pure, Railway hosts Twenty server/worker/Postgres/Redis/backup cron, Cloudflare provides DNS and R2 object storage/backups, and Supabase remains the source or mirror for XO Pure customer, ambassador, order, and ecommerce data via a dedicated sync layer.

## Repository Identity

| Area | Current Finding |
|---|---|
| Repo root | `/Users/brians/Documents/xopure_crm/Xopure_crm` |
| Upstream product | Twenty CRM |
| License | AGPL-3.0 |
| Monorepo manager | Nx |
| Package manager | Yarn 4.13.0 |
| Required Node | `^24.5.0` from `package.json` |
| Backend | NestJS, TypeScript, TypeORM, PostgreSQL, Redis, BullMQ |
| Frontend | React, Vite, Jotai, Linaria, Lingui |
| APIs | GraphQL at `/graphql`, REST at `/rest`, app logic routes under `/s/*` |
| Main local dev ports | server `3000`, frontend `3001` |

## Top-Level Packages

| Package | Purpose |
|---|---|
| `packages/twenty-server` | NestJS API server, metadata engine, auth, workflow APIs, webhooks, queue producers, migrations, workspace manager. |
| `packages/twenty-front` | Main React CRM UI. |
| `packages/twenty-shared` | Shared TypeScript types, metadata constants, utilities. |
| `packages/twenty-ui` | Shared UI component library. |
| `packages/twenty-sdk` | App definition SDK for custom objects, fields, roles, views, functions, components, skills, agents. |
| `packages/twenty-client-sdk` | Generated/client SDK used by apps and integration code. |
| `packages/twenty-apps` | Example, fixture, community, and internal Twenty apps. Best place to model XO Pure app code. |
| `packages/twenty-docker` | Docker Compose, Helm, and local self-hosting assets. |
| `packages/twenty-docs` | In-repo product/developer docs. Useful for local reference when implementing extensions. |
| `packages/twenty-emails` | Email templates and localization. |
| `packages/twenty-zapier` | Zapier integration package. |
| `packages/twenty-website-new` | Marketing/docs website. Not needed for XO Pure CRM operations. |
| `packages/create-twenty-app` | App scaffolding CLI package. |
| `packages/twenty-cli` | CLI package for Twenty app workflows. |
| `packages/twenty-companion` | Desktop companion app. Not required for initial XO Pure CRM. |

## Runtime Components

### Twenty Server

The server is the primary HTTP service. It handles:

- Authentication, JWT/session handling, workspace access, invitations, 2FA, SSO modules.
- GraphQL API and REST API.
- Metadata API for custom objects, fields, views, roles, permissions, navigation, pages, webhooks, apps, skills, agents, front components, and logic functions.
- Record CRUD operations for standard and custom objects.
- Workflow builder and workflow trigger APIs.
- Webhook dispatch jobs.
- File storage abstraction.
- Email sending.
- Health checks through `/healthz`.
- Database migrations on server boot when using the official Docker image.

Key files:

- `packages/twenty-server/src/app.module.ts`
- `packages/twenty-server/src/engine/core-modules/core-engine.module.ts`
- `packages/twenty-server/src/engine/api/graphql/core-graphql-api.module.ts`
- `packages/twenty-server/src/engine/api/rest/rest-api.module.ts`
- `packages/twenty-server/src/engine/core-modules/health/health.module.ts`

### Twenty Worker

The worker consumes BullMQ background jobs using Redis. It should run the same Twenty image/tag as the server, but with `yarn worker:prod`.

Responsibilities include:

- Workflow/background task execution.
- Webhook delivery jobs.
- Async CRM processing.
- App/logic function related jobs where applicable.

Operational requirement: Redis must use `maxmemory-policy=noeviction`; eviction can lose BullMQ jobs.

### PostgreSQL

Twenty stores CRM metadata and object records in PostgreSQL. On Railway, `PG_DATABASE_URL` should reference the managed Postgres service. Supabase should not replace Twenty's Postgres unless a deliberate architecture change is made; Twenty expects its own database schema and migration lifecycle.

### Redis

Redis backs message queues and cache-like runtime services. On Railway, `REDIS_URL` should reference the managed Redis service.

### Object Storage

Twenty supports local and S3-compatible storage. The additions package proposes Cloudflare R2 for stateless attachment storage:

- `STORAGE_TYPE=s3`
- `STORAGE_S3_REGION=auto`
- `STORAGE_S3_NAME=xopure-twenty-uploads`
- `STORAGE_S3_ENDPOINT=https://<account_id>.r2.cloudflarestorage.com`

## Standard CRM Capabilities

Twenty provides the following standard CRM primitives out of the box:

| Capability | Notes |
|---|---|
| People | Contact/person records. Good fit for customers and ambassadors when a person-centric record is enough. |
| Companies | Account/company records. Useful for wholesale partners, retailers, agencies, or business buyers. |
| Opportunities | Pipeline/deal records. Useful for wholesale, partnerships, ambassador opportunities, and sales workflows. |
| Tasks | Action items assigned to team members. |
| Notes | Notes attached to records. |
| Attachments | File uploads through configured storage. |
| Timeline activity | Activity history on records. |
| Views | Saved list/table/kanban-like views with fields, filters, sorts, and groups. |
| Dashboards | Dashboard metadata and widgets exist in the standard application layer. |
| Search | Server search module and frontend search affordances. |
| Workspace members | Internal team users and permissions. |
| Roles/permissions | Object, field, settings, and platform permission flags. |
| API keys | Developer API access. |
| Webhooks | Event delivery for record and metadata changes. |
| Workflows | No-code/low-code automation engine. |
| Apps | Code-defined extensions using `twenty-sdk`. |
| AI skills/agents | App-defined AI capabilities and agents. |
| Email/calendar/messaging modules | Google/Microsoft/IMAP/SMTP/CALDAV modules exist but need provider config to enable. |

Standard objects cannot be deleted; labels can be renamed, and standard objects can be deactivated from the UI while preserving data.

## API Capabilities

### GraphQL

GraphQL is available at `/graphql`. It is used heavily by the frontend and generated clients. It is the most complete API surface for object and metadata operations.

### REST

REST is available at `/rest`. It can be useful for external systems and simpler integrations.

### Logic Function Routes

Twenty apps can expose logic function HTTP routes under `/s/*`. Example: a function configured with path `/post-card/create` is callable at `/s/post-card/create`.

Logic function route handlers can receive forwarded headers if explicitly listed in `forwardedRequestHeaders`, which is important for webhook signature verification.

## Workflow Capabilities

Twenty workflows can be built from the UI. They support these trigger types:

- Record created/updated/deleted events.
- Scheduled/cron-like triggers.
- Manual triggers.
- Webhook triggers.

Workflow actions include:

- Create, update, delete, search, and upsert records.
- Iterator over arrays.
- Filter/branching behavior.
- Delay.
- Send email.
- Code step.
- HTTP request step.
- Form input step.
- AI agent action, currently documented as coming soon in the audited docs.

For XO Pure, workflows are useful for internal CRM automation, but the core Supabase sync should be implemented as deterministic code with idempotency, logging, retries, and explicit conflict handling. Workflows can then sit on top for team notifications and operational automations.

## App Extension Capabilities

Twenty apps are TypeScript packages built with `twenty-sdk`. They can define:

- Custom objects and fields.
- Fields on existing standard objects.
- Roles and object/field permissions.
- Application variables, including secrets.
- Server-side logic functions.
- HTTP route, cron, database-event, workflow-action, and tool-triggered functions.
- Front components rendered inside the CRM UI.
- Skills and agents.
- Views and navigation menu items.
- Page layouts and widgets.

Relevant examples:

- `packages/twenty-apps/examples/hello-world`
- `packages/twenty-apps/examples/postcard`
- `packages/twenty-apps/fixtures/rich-app`
- `packages/twenty-apps/internal/self-hosting`

Recommended XO Pure pattern: create a dedicated app package, for example `packages/twenty-apps/internal/xopure-crm` or a new external app repo, and define custom XO Pure objects there instead of editing Twenty core tables directly.

## Proposed XO Pure Data Model

The current repository does not yet include XO Pure custom objects. The CRM should add them using Twenty app definitions or metadata API operations.

Recommended object strategy:

| Domain Concept | Recommended Twenty Representation | Reasoning |
|---|---|---|
| Customer | Standard `person` plus custom customer fields, or custom `xopureCustomer` object linked to `person`. | Use `person` for contact identity; use custom object if Shopify/Supabase lifecycle is complex. |
| Ambassador | Custom `xopureAmbassador` linked to `person`. | Ambassador lifecycle, code, payouts, tiers, and content metrics deserve dedicated fields. |
| Order | Custom `xopureOrder` linked to `person` and optionally `company`. | Orders are transactional and should mirror ecommerce/Supabase data. |
| Subscription | Custom `xopureSubscription` linked to `person`. | Useful if XO Pure uses subscriptions/replenishment. |
| Product | Custom `xopureProduct` or external reference fields if product catalog is small. | Needed for order line visibility and segmentation. |
| Order line | Custom `xopureOrderLine` linked to order and product. | Only needed if CRM users need item-level details. |
| Ambassador code/referral | Field on ambassador or custom `xopureReferralCode`. | Depends on whether ambassadors can have multiple codes. |
| Commission/payout | Custom `xopureCommission` linked to ambassador and order. | Keeps financial/audit data explicit. |
| Sync map | Supabase table `crm_sync_map` and optionally a Twenty custom object for observability. | Required for idempotent cross-system sync. |

Minimum custom fields on `person`:

- `supabaseCustomerId`
- `shopifyCustomerId` or ecommerce customer ID if applicable
- `customerStatus`
- `customerTags`
- `lifetimeValue`
- `lastOrderAt`
- `orderCount`
- `isAmbassador`
- `ambassadorId` or relation to ambassador object
- `preferredContactChannel`
- `sourceSystem`
- `lastSyncedAt`

Minimum ambassador object fields:

- `person` relation
- `supabaseAmbassadorId`
- `status`
- `tier`
- `referralCode`
- `applicationDate`
- `approvalDate`
- `socialHandles`
- `discountCode`
- `commissionRate`
- `totalRevenueAttributed`
- `totalCommissionEarned`
- `lastActivityAt`
- `notes`
- `lastSyncedAt`

## Supabase Sync Capabilities And Constraints

The audited repo does not currently contain Supabase sync code. The additions runbook references a future Vercel sync layer and a Supabase `crm_sync_map` table, but no implementation was found in the additions folder.

Recommended sync architecture:

| Direction | Trigger | Handler | Target |
|---|---|---|---|
| Supabase to Twenty | Supabase database webhook or scheduled backfill | Sync API endpoint or Twenty app HTTP route | Twenty REST/GraphQL API |
| Twenty to Supabase | Twenty webhook on record changes | Sync API endpoint | Supabase service-role server client |
| Backfill | Manual CLI/API job | Paginated importer | Both systems via `crm_sync_map` |
| Reconciliation | Scheduled cron | Diff job by `updated_at`/checksums | Repair drift and alert |

Idempotency requirements:

- Use a stable source ID from Supabase for each external record.
- Store the Twenty record ID once created.
- Use `crm_sync_map` with unique constraints on `(source_system, source_table, source_id)` and `(twenty_object, twenty_record_id)`.
- Record last synced timestamp, content hash, last error, retry count, and sync direction.
- Avoid infinite loops by writing `last_written_by='supabase-sync'`/`'twenty-sync'` or equivalent and suppressing echoed webhook events.

Supabase security requirements:

- Never expose `service_role` or secret keys to the browser.
- Enable RLS on exposed schemas and tables, especially `public`.
- Do not rely on user-editable `user_metadata` for authorization.
- Put privileged sync functions in a private/unexposed schema when database functions are needed.
- Treat customer and ambassador data as sensitive PII.

## Additions Folder Audit

Path: `/Users/brians/Downloads/crm_xopure_additions`

Files found:

| File | Purpose |
|---|---|
| `README.md` | Overview of Railway + R2 self-hosting architecture. |
| `RUNBOOK.md` | Initial deploy, upgrade, restore, common ops, cost estimate, and emergency contacts. |
| `.env.example` | Intended production environment variable inventory. |
| `setup.sh` | Generates `APP_SECRET` and `BACKUP_ENCRYPTION_KEY`, checks Railway/JQ/OpenSSL prerequisites. |
| `backup.sh` | Root-level duplicate/flattened copy of backup script. |
| `Dockerfile` | Root-level server Dockerfile copy. |
| `railway.toml` | Root-level server Railway config copy. |
| `xopure-twenty-infra.tar.gz` | Archive containing full `services/server`, `services/worker`, and `services/backup` layout. |

Archive contents:

- `services/server/Dockerfile`: `FROM twentycrm/twenty:v0.32.0`, exposes port 3000.
- `services/server/railway.toml`: Dockerfile builder, `/healthz` healthcheck, crash retry policy.
- `services/worker/Dockerfile`: `FROM twentycrm/twenty:v0.32.0`, command `yarn worker:prod`.
- `services/worker/railway.toml`: Dockerfile builder, crash retry policy, no HTTP healthcheck.
- `services/backup/Dockerfile`: `postgres:16-alpine` with `aws-cli`, `gnupg`, `coreutils`, `bash`, `curl`.
- `services/backup/backup.sh`: `pg_dump --format=custom --no-owner --no-acl`, gzip, GPG AES256, upload to R2, prune old backups.
- `services/backup/railway.toml`: hourly cron at minute 7, retry policy.

Important issue in backup restore docs: `backup.sh` uses `pg_dump --format=custom` and then gzip/encrypts it. After decrypting and gunzipping, the output is a custom-format dump, not plain SQL. Restore should use `pg_restore`, and the restored file should be named `.dump` or `.pgdump`, not `.sql`, to avoid confusion.

## Railway Deployment Capability

The additions package proposes three Railway services:

| Service | Type | Command/Image | Dependencies |
|---|---|---|---|
| `twenty-server` | Web service | `twentycrm/twenty:v0.32.0` default entrypoint | Postgres, Redis, R2 uploads, SMTP |
| `twenty-worker` | Background worker | `yarn worker:prod` in same image | Postgres, Redis, R2 uploads, SMTP |
| `twenty-backup` | Cron service | `/app/backup.sh` | Postgres, R2 backups |

Railway managed services needed:

- Postgres.
- Redis with `noeviction` maxmemory policy.

Critical environment variables:

- `PG_DATABASE_URL=${{Postgres.DATABASE_URL}}`
- `REDIS_URL=${{Redis.REDIS_URL}}`
- `APP_SECRET`
- `SERVER_URL=https://crm.xopure.com`
- `NODE_PORT=3000` or mapped to Railway `$PORT` if needed by deployment behavior.
- `MESSAGE_QUEUE_TYPE=bull-mq`
- `IS_SIGN_UP_DISABLED=true` after first admin creation.
- R2 storage variables for uploads.
- SMTP variables for Resend or another mail provider.
- Optional `SENTRY_DSN`.

## Cloudflare Capability

Cloudflare is used for:

- DNS for `crm.xopure.com` pointing to Railway's generated CNAME target.
- R2 bucket `xopure-twenty-uploads` for attachments.
- R2 bucket `xopure-twenty-backups` for encrypted Postgres dumps.
- R2 API token scoped to both buckets.
- R2 lifecycle policy, preferably delete backups after 90 days.

Cloudflare may also protect the domain with proxy/WAF rules, but the additions package only documents DNS and R2.

## Email Capability

Twenty supports SMTP email. The additions package assumes Resend SMTP:

- `EMAIL_FROM_ADDRESS=crm@xopure.com`
- `EMAIL_FROM_NAME=XO Pure CRM`
- `EMAIL_DRIVER=smtp`
- `EMAIL_SMTP_HOST=smtp.resend.com`
- `EMAIL_SMTP_PORT=465`
- `EMAIL_SMTP_USER=resend`
- `EMAIL_SMTP_PASSWORD=<Resend API key>`

Email is needed for invites, password reset, verification, and workflow-generated emails depending on enabled features.

## Auth And Access Capability

Twenty includes:

- Password auth toggle.
- Signup controls.
- Workspace invitations.
- Workspace users and roles.
- API keys.
- App tokens.
- SSO modules.
- 2FA module.
- Google/Microsoft auth provider modules if configured.

Deployment must keep public signup closed after the initial admin is created.

## Observability And Operations

Available/proposed tools:

- Railway logs, deployments, healthchecks, and metrics.
- `/healthz` on server.
- Sentry via `SENTRY_DSN` if configured.
- Application logs module in Twenty.
- Event logs/audit modules in Twenty server.
- Cloudflare/R2 object listings for backup confirmation.
- Manual smoke tests: login, create a contact, create a webhook, verify persistence, verify backup after 65 minutes.

## Current Gaps

The following are not implemented yet in the audited app/additions:

- XO Pure custom data model objects/fields.
- Supabase client dependency/configuration in this repo.
- Supabase database migrations for `crm_sync_map`.
- Supabase webhook handler endpoints.
- Twenty webhook handler endpoints for reverse sync.
- Backfill/import scripts for customers, ambassadors, orders, and related data.
- Conflict resolution policy between Supabase and Twenty.
- End-to-end integration tests covering Supabase to Twenty and Twenty to Supabase.
- Railway service files copied into the main repo root in their archived `services/*` layout.
- Cloudflare R2 credentials and bucket verification.
- Production environment variable values.
- Custom domain verification.

## Recommended System Boundary

Use Twenty as the human-facing CRM and operational workflow platform. Use Supabase as the application/ecommerce data store or mirror. Do not try to make Supabase directly write into Twenty's internal Postgres tables. Integrate through Twenty's public APIs, webhooks, workflows, and app SDK so migrations and upgrades remain supportable.
