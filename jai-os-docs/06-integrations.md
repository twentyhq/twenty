# External Integrations

Read this when setting up or debugging an external service connection. Behavioral logic for how each integration is used lives in the relevant agent file — this file covers only the connection/setup side.

## WhatsApp Business Cloud API

Official Meta API — not an unofficial library (e.g., Baileys). Unofficial clients risk the business number getting banned, which would take down a live client-facing channel entirely.

- Requires Meta Business verification and a WhatsApp Business API application. **This has real approval lead time and is the slowest external dependency in the whole build** — start this application early, in parallel with unrelated work, rather than waiting until the WhatsApp agent phase to begin it (see `08-build-phases.md`).
- Needs a webhook endpoint set up to receive inbound messages — this is what the WhatsApp agent listens on.
- One setting is easy to miss and silently breaks CTWA attribution if skipped: **"Ads attribution" must be manually enabled in the WhatsApp Business Account settings.** It's off by default. Without it, Meta ad referral data never arrives, with no error to indicate why.

## Meta Click-to-WhatsApp (CTWA)

Not a separate integration or API to connect — rides entirely on the WhatsApp webhook above. When a lead arrives via a Click-to-WhatsApp ad, the first inbound message carries a `referral` object containing `source_id` (ad ID), `headline`, `body`, `media_type`, and `ctwa_clid`. No additional setup beyond the "Ads attribution" setting above.

Optional, not currently required: Meta's Conversions API (CAPI) can report conversions back to Meta so its ad algorithm optimizes toward better leads over time. Not built now — worth knowing it exists if ad performance becomes a bigger focus later.

## Google Calendar API

OAuth scoped to the founder's personal calendar specifically — not a service account, not a shared team calendar. Needs both:
- Read access (check availability before proposing a time)
- Write access (create the event, only after human confirmation via Telegram)

The founder needs to complete the OAuth consent flow once during setup to grant this access.

## Telegram Bot API

Free, no per-message cost, no complex account setup — a bot is created via Telegram's BotFather to get a bot token.

- **Must be hardcoded to respond only to the founder's specific Telegram chat ID.** A Telegram bot is otherwise publicly reachable by anyone who finds it — since this bot approves money-related actions and hands out task assignments, this restriction is a real security requirement, not a nice-to-have.
- Uses Telegram's inline keyboard buttons for one-tap Approve/Reject on every approval request — this is the actual reason Telegram was chosen over alternatives like email or WhatsApp for this purpose (see `01-tech-stack.md`).