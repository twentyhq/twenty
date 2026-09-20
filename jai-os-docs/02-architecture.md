# Architecture

Read this when implementing the Controlled Tool API, wiring an agent to Twenty, or understanding how data flows between components. This file covers structure and connections only — full behavior for each individual agent lives in `03-agents/`, not duplicated here.

## System layers, top to bottom

1. **Twenty CRM** — the source of truth. Every fact about leads, clients, tasks, projects, and invoices lives here. Other components may retain temporary processing payloads and workflow checkpoints, but do not maintain an independent authoritative CRM dataset.
2. **Controlled Tool API** — the only path into or out of Twenty for any agent. See below.
3. **Agent layer** — Manager, WhatsApp, Reporting, Assistant. Full behavior specs in `03-agents/`.
4. **Twenty's native workflow engine** — deterministic automation (invoice reminders, notifications), runs independently of the agent layer.
5. **External systems** — WhatsApp Business API, Google Calendar, Fireworks/OpenAI, Telegram.

## The Controlled Tool API

This is the single most important boundary in the system. No agent — Manager, WhatsApp, Reporting, or Assistant — ever calls Twenty's database or GraphQL API directly. Every read or write goes through this layer, which:

- Exposes a whitelisted set of functions only (e.g., "look up contact by phone," "create lead," "update deal status") — never raw query access.
- Checks the calling agent's permission scope before executing. The Assistant agent's calls are read-only at this layer, not just by convention — a write call from Assistant should fail here even if something upstream is misconfigured.
- Is where an agent's permission boundary is actually enforced, not in the agent's own prompt or logic. Prompt-level restrictions can be talked around; a function that doesn't exist for that agent can't be.

## Entry points into the Manager agent

Two, both founder/admin-only:

- **Telegram bot**, hardcoded to the founder's chat ID. Used for approval requests (inline buttons) and for giving the Manager direct instructions (e.g., task assignment).
- **Twenty-embedded chat widget**, a single component with a toggle routing to either Manager (admin) or Assistant (staff + admin), gated by a real permission check.

## Data flow: an inbound WhatsApp message, end to end

Useful as a reference trace when building or debugging the WhatsApp path:

1. Message arrives at the WhatsApp webhook. Verify its signature, deduplicate by provider event/message ID, and commit it to the durable agent inbox before acknowledging receipt. A dispatcher queues processing; after a restart it requeues unfinished inbox entries.
2. WhatsApp agent's first action, always: look up the sender's number against Twenty via the Controlled Tool API.
3. No record found → create a new lead record. If the inbound message carries Meta CTWA referral metadata, tag the new lead with the ad/campaign source at the same time.
4. Record found, status is Closed/Won → treat as a client. Any other status → treat as a lead.
5. Classify the message. Routine (FAQ, scheduling, general conversation) → agent replies autonomously. Money or contract topic → escalate: Manager reviews, founder gets a Telegram approval request, no autonomous reply sent.
6. If the message is a booking request → check the founder's Google Calendar for availability → propose a time in the reply → on confirmation, a human approves via Telegram before the calendar invite actually goes out.

## Memory architecture

One shared memory pool, not per-agent silos:

- **Read access**: wide — any agent can read what another agent has written (e.g., WhatsApp agent can see a priority flag the Manager set).
- **Write access**: restricted per fact type — not every agent can write every kind of fact. A low-confidence inference from one agent should not silently become another agent's trusted input; it should surface as a proposal instead (see the human-approved learning loop in `05-features.md`).
- **Duration**: varies by agent — see each agent's file in `03-agents/` for specifics, since retention needs differ (a client relationship needs long memory, a single reporting query does not).

## Observability and guardrails, placement

Both wrap every LLM call across every agent, not bolted onto one agent specifically:

- **LLM Guard** scans every input and output — before the LLM call and after — for PII leakage, prompt injection, and toxicity.
- **Arize Phoenix** traces every LLM call and tool call across the whole agent stack, via its native LangGraph and Vercel AI SDK instrumentation. One dashboard, not one per agent.

Neither of these appears as its own box in the data flow above — they sit around every step that touches an LLM, silently, the same way a linter sits around every file rather than being a step in the pipeline itself.

## Durable processing and approval recovery

- Run agent jobs through self-hosted BullMQ community edition and dedicated persistent Redis. Process each conversation in order, limit concurrency, and retry transient failures with bounded backoff. Keep failed jobs visible for human review.
- Store inbox entries, execution status, LangGraph checkpoints, and approvals in a separate agent PostgreSQL database with isolated credentials. This is operational state, not a second CRM. Every agent action still passes through the Controlled Tool API; persistence does not grant agents direct access to Twenty's database.
- Enforce duplicate protection at the Controlled Tool API as well as the queue. Record a stable action ID and outcome so webhook redelivery, worker restart, or repeated approval clicks cannot blindly repeat a completed action.
- External calls can succeed even when the response is lost. Use provider idempotency support where available; otherwise reconcile uncertain results or request human review before retrying an external write or send. Do not claim exactly-once delivery merely because the queue deduplicates jobs.
- Persist the proposed action, founder identity, approval status, expiry, and execution result. Bind approval to the exact action payload. After a restart, pending actions remain pending; expired, rejected, or already executed approvals cannot authorize execution. Money and contract topics always require human escalation; queue retries never bypass it.
- Include the agent database and configuration in backups. Keep unresolved events and pending approvals through routine retention cleanup; minimize and expire resolved payloads according to their purpose.

## Deployment and operations

Keep Caddy as the public entry point and internal services on private Docker networks. Apply the resource limits, backup/restore procedures, monitoring, and version-pinning rules in `01-tech-stack.md`. All additions run with free/open-source software within the existing VPS budget. Local staging uses synthetic data and cannot send real messages or execute live integrations.
