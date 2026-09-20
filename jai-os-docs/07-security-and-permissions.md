# Security and Permissions

Read this when implementing anything touching access control or approval gates. This consolidates rules that appear individually in other files — the goal here is the full security picture in one place, not new information.

## Access matrix

| Agent | Who can reach it |
|---|---|
| Manager | Founder/admin only |
| WhatsApp | Founder/admin configures it; the agent itself talks to external leads/clients |
| Reporting | Founder/admin only |
| Assistant | Staff and admin |

Enforced at two points, not one: the Twenty-embedded widget's toggle routes based on logged-in role, and the Controlled Tool API independently checks permission scope on every call. The toggle is a UI convenience — the Controlled Tool API check is the actual boundary. If those two ever disagree, the API check wins.

## The Controlled Tool API is the real enforcement point

No agent — including Assistant — ever calls Twenty's database or GraphQL API directly. Every read or write goes through this layer (see `02-architecture.md`), which is where permission scope is actually checked. This matters specifically because prompt-level restrictions ("you may only read, never write") can be talked around by a sufficiently unusual input; a function that doesn't exist for that agent's scope cannot be. Assistant's read-only restriction, in particular, should be enforced here, not just assumed from its instructions.

## The one universal rule with zero exceptions

Any money or contract topic, in any agent, at any hour, always escalates to a human before anything is sent or committed. This is the single hardest boundary in the system — see `03-agents/whatsapp-agent.md` for the specific escalation path.

## Telegram bot lockdown

The Telegram bot must be hardcoded to respond only to the founder's specific chat ID. A Telegram bot is otherwise publicly reachable by anyone who finds it, and this bot approves money-related actions and task assignments — an unrestricted bot here would be a direct hole into the approval system.

## Guardrails as a security control, not just a quality one

LLM Guard scans every input and output, across every agent, for PII leakage, prompt injection, and toxicity — see `01-tech-stack.md` for why it was chosen. This sits around every LLM call, not as an optional add-on to one agent.

## Self-learning is a security boundary too

No agent ever applies a behavior change to itself automatically, under any circumstance. Every proposed change sits until the founder approves it via Telegram — see `05-features.md` for the full mechanism. This exists specifically to prevent an agent drifting into unsafe behavior based on a misread signal, with nothing to catch it until real damage is visible.

## Known, accepted risks (not oversights)

- **Backups live on the VPS only**, no off-site copy. A VPS-level failure takes out the live data and the backup together. This was an explicit trade-off for simplicity, made with that consequence understood.
- **LLM data jurisdiction**: the primary model is accessed via Fireworks AI specifically to avoid routing client PII through DeepSeek's own China-hosted API — see `01-tech-stack.md` for the full reasoning. Any future change to the LLM provider should be checked against this same concern before being made.

## Infrastructure controls

- Only required application and webhook routes are public through Caddy. Do not publish PostgreSQL, Redis, LLM Guard, or Phoenix/dashboard ports publicly. Restrict SSH administration and use SSH tunnels for private dashboards.
- Separate agent-state credentials from Twenty's database credentials. Persistence workers can write operational state but cannot read or modify Twenty's database directly. Agent CRM access remains exclusively through the Controlled Tool API.
- Keep secrets out of Git, logs, and traces. Restrict host secret-file permissions and grant each container only what it needs. Compose secret mounts do not encrypt host files automatically. Encrypt backup contents and protect recovery credentials separately.
- Verify inbound webhook signatures before persisting accepted events. Recheck permissions and the exact approved action at execution time. Persist approval expiry and execution status; reject replayed, expired, or modified requests. Restarts and retries never turn pending approvals into permission to act.
- Redact sensitive content before diagnostics reach Phoenix or logs, and apply bounded retention. Diagnostic cleanup must not delete unresolved approval or job records. Resource exhaustion or unavailable guardrail scans must pause protected work, not bypass checks.
- Restore tests and upgrade trials run in isolated environments with synthetic data where possible and real outbound integrations disabled. No paid infrastructure additions or automatic hosting upgrades are authorized.
