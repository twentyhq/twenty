# Cross-Cutting Features

Read this when implementing a feature that spans more than one agent. Calendar booking and Meta CTWA lead capture are single-agent features fully specified in `03-agents/whatsapp-agent.md` — not repeated here. Task assignment is Manager-exclusive and fully specified in `03-agents/manager-agent.md`. What follows is the material that's genuinely shared across agents.

## Notifications, by event

A quick-reference table — full logic for each event lives in the agent file that owns it.

| Event | Channel | Detail lives in |
|---|---|---|
| Founder approval needed (appointments, escalations, learning-loop proposals) | Telegram, inline Approve/Reject buttons | `03-agents/manager-agent.md` |
| Employee assigned a task | Twenty in-app notification only | `03-agents/manager-agent.md` |
| Client invoice/payment reminder | WhatsApp, via the WhatsApp agent | `03-agents/whatsapp-agent.md`, `04-data-model.md` |
| Reporting agent answer | Same channel the question came from | `03-agents/reporting-agent.md` |

The pattern worth noticing: nothing client-facing ever goes through Telegram, and nothing founder-facing (approvals) goes through WhatsApp. The two channels don't cross.

## Human-approved learning loop

Applies to every agent, with one shared mechanism:

1. An agent notices a repeated pattern in its own outcomes (not a single instance) and drafts a specific, concrete proposed change — not a vague "I could do better," an actual change to a rule or behavior.
2. The proposal surfaces to the founder via Telegram, as an inline Approve/Reject prompt — the same mechanism used for every other approval.
3. **Approved**: the change takes effect for future behavior.
4. **Rejected**: the proposal is discarded, agent behavior stays exactly as it was.
5. Nothing is ever applied automatically, under any circumstance, for any agent — this is the one rule with zero exceptions anywhere in the system.

Why this exists: an agent that adjusts its own behavior based on signals it infers (did the client reply faster, did no one correct it) has no reliable way to know those signals mean what it thinks they mean. A wrong inference compounds silently, with no visible failure to catch it — which is the opposite of what this system is for. Keeping the founder as the one who decides what "better" actually means is the entire point of this loop.

One deliberate asymmetry: the WhatsApp agent's proposals (see `03-agents/whatsapp-agent.md`) get the same approval requirement as every other agent, but its tone/behavior proposals specifically are treated as needing full manual review every time, with no lighter or faster path — it's the only agent whose mistakes reach a real external person with zero internal buffer.