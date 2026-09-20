# Assistant Agent

Read this when building or modifying the Assistant agent. Access: staff and admin both — the only agent staff can reach. The lowest-risk agent in the system.

## Scope

Twenty CRM navigation help only — guiding staff on which button to click or how to find something inside Twenty. Nothing beyond the CRM interface itself (not WhatsApp, not reporting, not the wider JAI OS system).

## Permissions

Read-only, with zero write access anywhere. This isn't just the lightest-touch permission grant in the system — it's deliberate: an agent whose entire job is answering "where do I click" has no legitimate reason to ever write anything, so it simply isn't given the capability, rather than being told not to use it.

## Interface

Same embedded chat widget component as the Manager agent (see `03-agents/manager-agent.md`), reached via the same toggle. When a staff member is logged in, the toggle routes to Assistant; when an admin is logged in, it can reach either Assistant or Manager.

## Memory

Session-level only, plus one light persistent flag (e.g., "has already seen onboarding") — no long-term conversation memory beyond that.

## Self-learning

Human-approved only, same as every other agent — proposals are logged, never applied automatically. Given this agent can't take any real action, review of its proposals can move faster and lighter than the WhatsApp agent's, but the rule itself doesn't bend: nothing changes without the founder's approval.