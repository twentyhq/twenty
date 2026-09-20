# Build Phases

Read this when planning what to build next or sequencing work. The order here isn't arbitrary — it's foundation first, then prove the agent pattern on the safest possible surface, then build up to the highest-risk piece last, while starting anything with a long external wait time as early as possible.

## Phase 1 — Foundation: Twenty CRM live

Self-host Twenty on the VPS via Docker Compose, set up Admin/Member roles, build the custom Invoice object with GST fields (`04-data-model.md`), wire up backups and SSL.

Include the free infrastructure improvements from `01-tech-stack.md`: private Docker networking, restricted secrets, resource limits, log rotation, pinned versions, host/service health checks, and complete encrypted same-VPS backups. Prove a restore in an isolated local environment and document the upgrade/rollback procedure. Retain local monitoring records until Telegram alerts are available in Phase 2. Use the existing VPS only; no additional paid services or hosting upgrades.

**Also start here, in parallel**: the WhatsApp Business API application. Meta's approval process is the slowest external dependency in this entire build (`06-integrations.md`) — starting it now means it's not what you're stuck waiting on three phases from now.

## Phase 2 — Agent plumbing, before any agent exists

Wire Fireworks AI (primary) and OpenAI (fallback) through the Vercel AI SDK, stand up Arize Phoenix, get LLM Guard scanning inputs/outputs, set up the Telegram bot locked to the founder's chat ID, and build the Controlled Tool API — the boundary every agent will call through instead of touching Twenty directly (`02-architecture.md`).

Add the durable agent inbox, BullMQ community queue with dedicated persistent Redis, LangGraph PostgreSQL checkpoints, and approval records in a separate database with isolated credentials. Implement bounded retries, duplicate protection, uncertain-result handling, queue alerts, and retention. Add agent state to backups, wire infrastructure alerts to the founder's Telegram chat, and verify restart recovery without bypassing approvals. Measure combined resource usage, especially LLM Guard and Phoenix, and tune concurrency within the existing VPS capacity.

## Phase 3 — Manager agent, founder-only proof of concept

Build the Manager agent on DeepAgents, reachable via Telegram and the Twenty-embedded widget. At this stage it's only the founder talking to it, reading and writing CRM records through the Controlled Tool API. This phase exists to prove the whole agent pattern works before anything touches a real lead.

## Phase 4 — Reporting agent, first real agent live

The lowest-risk of the three real agents: read-only, on-demand, no autonomous actions (`03-agents/reporting-agent.md`). A good first agent to actually rely on daily while the riskier piece gets built.

## Phase 5 — WhatsApp agent + one week of testing

The core of the system and the highest-risk piece — built last, not first, on purpose. Wire the WhatsApp webhook, CTWA ad tagging, lead/client detection, Tamil/Tanglish handling, calendar booking, and the money/contract escalation path (`03-agents/whatsapp-agent.md`).

Then the week of manual testing before this touches a real lead: specifically test a Tanglish message, a pricing question (confirms escalation actually fires), and a message from a brand-new number (confirms lead creation works) — not just clean English test messages, which won't catch the failure modes that actually matter here.

Also test duplicate webhook delivery, worker restart, provider timeout, repeated approval clicks, and expired approvals. Confirm that unfinished messages resume, completed actions are not blindly repeated, and money/contract actions remain blocked until human approval.

## Phase 6 — Task assignment + Assistant agent

Internal-facing, not client-facing — safe to build once the revenue-facing core is solid. Manager assigns tasks to staff on the founder's instruction (`03-agents/manager-agent.md`); staff get notified in Twenty. Assistant agent goes live for staff navigation help, read-only (`03-agents/assistant-agent.md`).

## Phase 7 — Human-approved learning loop

Only makes sense once the agents have real usage history to learn from — building it on day one would mean approving changes based on no data. Comes last: agents start proposing behavior tweaks, the founder approves or rejects each one via Telegram (`05-features.md`).
