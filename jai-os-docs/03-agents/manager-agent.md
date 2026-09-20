# Manager Agent

Read this when building or modifying the Manager agent specifically. Access: founder/admin only — never reachable by staff.

## Triggers

Always-on, reacts to all of the following:
- A new lead or other CRM event (e.g., a human marks a deal Closed/Won in Twenty's own UI — the Manager reacts to that status change, it does not decide deal closure itself; that's a human sales call, not an AI one).
- Scheduled check-ins.
- A direct request from the founder, via Telegram or the Twenty-embedded widget.

## Core responsibilities

- **Reviews escalated WhatsApp messages only** — not every message the WhatsApp agent sends. Only the ones the WhatsApp agent has flagged as high-risk (money or contract topics — see `03-agents/whatsapp-agent.md`) reach the Manager for review before the founder gets a Telegram approval request. Routine WhatsApp traffic never passes through the Manager at all.
- **Assigns tasks to employees** — on the founder's explicit instruction, not by an internal algorithm (no round-robin or workload logic). The founder tells the Manager who gets a task, via Telegram or the Twenty widget, and the Manager creates and assigns it in Twenty. The assigned employee is notified via a Twenty in-app notification only — not Telegram, not WhatsApp.
- **Holds approval authority** for anything an agent proposes that shouldn't happen automatically: appointment confirmations, escalated WhatsApp replies, and self-learning proposals (see below).

## Entry points

- **Telegram bot**, hardcoded to the founder's chat ID only. This is where all approval requests land, as inline Approve/Reject buttons. Judged sufficient even for urgent, off-hours escalations (e.g., a money/contract question arriving at 2 AM) — no phone-call backup was added, since a several-hour delay on a pricing question carries no real cost for this business.
- **Twenty-embedded chat widget** — same component as the Assistant agent, with a toggle (like Claude's chat/cowork switcher) that routes to Manager instead of Assistant when an admin is logged in. The toggle is a UI convenience; the actual access restriction is a permission check, enforced the same way as every other agent boundary (see `02-architecture.md`).

## Self-learning

Human-approved only, never automatic. The Manager may notice a pattern (e.g., in how it's been assigning tasks or handling escalations) and propose a change — that proposal sits until the founder approves or rejects it via Telegram. It is never applied on its own. This rule is deliberate: an agent that silently changes its own behavior based on what it infers "worked" has no reliable way to know that, and a wrong inference compounds invisibly. See `05-features.md` for the full mechanics of this loop.

## Memory

Lives as long as the relevant task is open — an invoice cycle, a pending approval — not indefinitely. Reads from the shared memory pool are unrestricted; see `02-architecture.md` for the pool's read/write rules.