# Tech Stack

Read this when choosing a library, setting up infrastructure, or asking "what do we use for X." Every entry includes why it was picked over the alternatives that were actually considered — that reasoning matters for future decisions, not just the name.

## CRM / data layer

- **Twenty CRM** (self-hosted) — github.com/twentyhq/twenty. AGPL-3.0, free, unlimited users on self-host. Chosen over Comp AI CRM (MIT license, better agent-safety patterns out of the box, but Vercel-native — Vercel Sandbox/AI Gateway/Blob would all need rebuilding on a plain VPS) because this is self-hosted single-tenant for one client, where AGPL's obligations don't bite, and Twenty ships free RBAC and mature self-hosting docker-compose support that Comp AI doesn't.
- **PostgreSQL** — Twenty's primary datastore.
- **Redis** — Twenty's caching and background jobs.
- **MinIO** — S3-compatible object storage, bundled with Twenty.
- **Twenty's native workflow automation** — triggers (record created, field changed, scheduled) + actions (create/update records, send email, call webhook) + conditional logic. Replaces n8n entirely. n8n was the original plan but Twenty's engine covers everything actually needed here (invoice reminders, notifications) without a second service on the VPS. Known limit: not built for deeply chained, many-branch automation — if this system ever needs that, n8n becomes the right call again.
- **Twenty Apps framework** (`npx create-twenty-app`, TypeScript SDK) — used for the custom Invoice object, the embedded chat widget (React component), and any server-side logic functions. Same AGPL-3.0 license as the core, no extra cost.
- **RBAC** — Admin/Member role split is free on self-host. Granular row-level/field-level permissions inside Twenty itself require the paid self-hosted "Organization" tier — not purchased. The admin-vs-staff access split for agents is enforced in the app layer (widget + Controlled Tool API), not inside Twenty's own permission engine, so this gap doesn't block anything currently planned.

## Agent layer

- **DeepAgents** (JS/TS package, not the Python one — keep everything in one language, matching the NestJS backend). Built on LangGraph. Chosen over plain LangGraph and over CrewAI because it gives sub-agent spawning with context isolation, declarative permission rules, and human-in-the-loop approval as built-in features — all three map directly onto the Manager → worker-agent structure and the approval-gate requirements here. CrewAI was ruled out for this project: ~18% higher token usage than LangGraph-based approaches, and harder to debug multi-agent failures at the depth this system needs.
- **LangGraph** — the orchestration layer underneath DeepAgents.
- **NestJS + TypeScript** — matches Twenty's own backend stack.

## LLM / model layer

- **Fireworks AI** — primary provider. Hosts DeepSeek's open-weight model on Fireworks' own Western infrastructure. This is deliberate: DeepSeek's own hosted API stores data in China under a legal framework that compels cooperation with state intelligence — real data-jurisdiction risk for a system handling real client PII. Fireworks (or Together AI, the backup option) serves the identical model weights without that risk, at a small, acceptable premium over DeepSeek's own pricing. OpenRouter was ruled out here specifically because it's an aggregator that can silently route to DeepSeek's own China-hosted backend unless explicitly excluded — a config setting that has to be maintained forever, not a structural guarantee.
- **OpenAI API** — fallback provider, used when Fireworks is unavailable or errors out.
- **Vercel AI SDK** — provider abstraction embedded directly in the NestJS backend. No separate routing proxy (like a standalone LiteLLM service) — one less moving part on a single VPS.

## Observability

- **Arize Phoenix**, self-hosted as a single Docker container (`arizephoenix/phoenix`). OpenTelemetry/OpenInference-native, with first-class instrumentation for both LangGraph and the Vercel AI SDK — one dashboard covers the whole agent stack. Chosen over Langfuse (which now requires Postgres + ClickHouse + Redis + S3 to self-host — four services versus Phoenix's one) and over Helicone (acquired by Mintlify in 2026, now in maintenance mode with no new features shipping).

## Guardrails

- **LLM Guard** — MIT licensed, scans inputs/outputs for PII leakage, prompt injection, and toxicity. Chosen over NeMo Guardrails specifically because NeMo requires learning Colang, its own DSL — unnecessary overhead for a solo-maintained build. LLM Guard is plain Python scanners, easier for one person (and Claude Code) to read and modify.

## Messaging

- **WhatsApp Business Cloud API** (official Meta API, paid). Not an unofficial library (e.g., Baileys) — unofficial clients risk the business number getting banned, which would take down a live client-facing channel.
- **Meta Click-to-WhatsApp (CTWA) ads** — no separate Meta integration needed. Ads referral data (`source_id`, `headline`, `ctwa_clid`) arrives directly inside the normal WhatsApp inbound webhook's `referral` object on the first message. Requires "Ads attribution" to be manually enabled in WhatsApp Business Account settings — off by default, and if missed, the referral data silently never arrives.

## Calendar

- **Google Calendar API** — books against the founder's personal calendar specifically, not a shared team calendar. Needs both read access (check availability before proposing a time) and write access (create the event, only after human confirmation — see 03-agents/whatsapp-agent.md).

## Human interface

- **Telegram Bot API** — free, no per-message cost. Used for all founder-facing approval requests (inline Approve/Reject buttons) and as one of two ways to talk to the Manager agent. Must be hardcoded to respond only to the founder's specific Telegram chat ID — a Telegram bot is otherwise publicly reachable by anyone who finds it.
- **Twenty embedded chat widget** — a custom React component via Twenty's Apps framework. One widget, one toggle (same pattern as Claude's chat/cowork switcher) routing to either the Manager agent (admin only) or Assistant agent (staff + admin), gated by an actual permission check — the toggle itself is not the security boundary.

## Invoicing

- **Custom "Invoice" object in Twenty** — not a native Twenty feature, built via the Apps framework's custom object support. Full GST-compliant field set: GSTIN (both parties), HSN/SAC code, taxable value, CGST/SGST or IGST split, sequential invoice numbering, place of supply. See 04-data-model.md for the exact schema.
- **PDF generation** — a small custom webhook-receiving script, triggered by Twenty's native workflow engine. Not a separate invoicing tool (Zoho/Razorpay were considered and ruled out — no need for a whole external system just for PDF generation and reminders).
- **Reminders** — sent via WhatsApp (through the WhatsApp agent), not email, to stay consistent with where the client relationship already lives.

## Infrastructure / hosting

- **Hostinger VPS**
- **Docker Compose**
- **Caddy** — reverse proxy with automatic SSL (Nginx + Certbot is the fallback option if Caddy doesn't fit).
- **Cost boundary for infrastructure improvements** — use free/open-source software on the existing VPS. No paid monitoring, managed queues/databases, extra servers, paid storage, or automatic VPS upgrades. The only approved paid categories remain LLM API usage, WhatsApp Business API, and existing VPS hosting. These improvements consume CPU, memory, and disk; measure capacity and limit workloads within the existing plan.
- **Backups and recovery** — scheduled `pg_dump` backups of Twenty and the separate agent database, plus uploaded files/object storage, deployment configuration, and securely protected secrets needed for recovery. Use free/open-source restic for encrypted file backups on the same VPS; keep its recovery password separately from the repository and out of source control. Coordinate database and file backups for a consistent recovery point. Start with 7 daily and 4 weekly recovery points, check available disk before adopting this retention, and alert on failures. Test a restore monthly and before major upgrades in an isolated local environment with outbound messaging disabled. Same-VPS storage remains an accepted limitation: VPS loss can destroy both production and backups. No off-site storage purchase is included.
- **Reliable background processing** — self-hosted BullMQ community edition with a dedicated Redis instance for agent jobs, separate from Twenty's cache, with persistence enabled and eviction disabled. A durable event inbox in the agent database is the recovery source; acknowledge inbound events only after they are committed there. Use bounded retries with backoff, duplicate protection, and a retained failed-job list for review. Do not use BullMQ Pro features.
- **Agent persistence** — LangGraph PostgreSQL checkpoints and durable approval records in a separate database with separate credentials. Reuse the existing PostgreSQL server where compatible; agent credentials have no access to Twenty's database. Store workflow state and references here; Twenty remains authoritative for CRM facts.
- **Private networking and secrets** — Caddy exposes required HTTPS application/webhook routes; databases, Redis, guardrails, and operational dashboards remain private. Use SSH access for administration and dashboard tunnels. Grant secrets only to services that need them through Compose secret files where supported, otherwise restricted environment files outside source control. Compose secrets are file mounts, not automatic encryption at rest.
- **Resource controls** — set container memory/CPU limits, bounded worker concurrency, health checks, and restart policies. Rotate container logs and cap trace/job retention. Start with 14 days of redacted diagnostic logs/traces and 7 days of completed job metadata; retain pending approvals and unresolved work until resolved. Measure LLM Guard and Phoenix alongside Twenty before increasing concurrency; resource limits must not bypass security scans.
- **Infrastructure monitoring** — lightweight scheduled host scripts and service health checks for disk, memory, service availability, backup freshness/failures, and queue age/failures. Send actionable alerts and recovery notices through the existing founder-only Telegram bot once configured. Keep local alert records in Phase 1. Phoenix remains responsible for AI traces. Checks running on this VPS cannot reliably alert when the whole VPS or its network is down; no paid external monitoring is included.
- **Controlled upgrades** — pin container versions (and digests where practical), commit non-secret deployment configuration, and test changes with synthetic data in a local isolated Compose environment. Take a verified backup before migrations and document rollback/restore steps. Do not automatically deploy new releases; reverting an image alone may not reverse a database migration.

## Language handling

- Tamil and Tanglish (code-switched Tamil in Latin script) support is required for the WhatsApp agent. No separate translation tool — handled through a confidence rule inside the agent logic: low confidence in understanding a message triggers a clarifying question instead of a guessed autonomous reply. See 03-agents/whatsapp-agent.md.
