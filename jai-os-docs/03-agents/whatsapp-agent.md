# WhatsApp Agent

Read this when building or modifying WhatsApp behavior. This is the highest-stakes agent in the system — it's the only one that sends messages autonomously to real, external people. Build and review accordingly.

## Scope

Talks to both leads and existing clients. Runs 24/7 — no business-hours restriction.

## Identity resolution — the first action on every inbound message, no exceptions

1. Look up the sender's phone number against Twenty CRM via the Controlled Tool API.
2. No record found → treat as a new lead. Auto-create the CRM record, then reply.
3. Record found, deal status is Closed/Won → treat as a client.
4. Record found, any other status → treat as a lead.

Deal status changes to Closed/Won happen when a human updates it directly in Twenty's own UI — this agent (and the Manager) only react to that change, never decide it.

## Autonomy boundaries

- **Sends autonomously**: anything except money or contract topics. This includes routine replies, FAQs, scheduling, and general conversation, for both leads and clients.
- **Always escalates, no exceptions**: any message touching pricing, discounts, or contract terms. Escalation path: Manager agent reviews it, founder gets a Telegram approval request before any reply goes out. This applies at any hour — a 2 AM pricing question still escalates immediately rather than waiting for business hours, on the reasoning that a Telegram push is enough for this business (no phone-call backup was built for this).

## Language handling

Must handle Tamil and Tanglish (Tamil written in Latin script, mixed with English), not English only. Code-switched, informal text is genuinely harder for any model to parse reliably than clean English — the mitigation is a confidence rule, not a translation layer: **if the agent's confidence in understanding a message is low, it asks a clarifying question instead of guessing and sending a wrong autonomous reply.** This matters more here than elsewhere because this agent already has autonomous send permission — a confident wrong answer in a less-certain language is a worse failure than in English.

## Calendar booking

Books against the founder's personal Google Calendar specifically — not a shared team calendar. Flow:
1. Check the founder's calendar for availability before proposing anything.
2. Propose a time in the WhatsApp reply.
3. A human confirms before the calendar invite actually goes out — this step is not autonomous, even though the proposal step is.

## Meta Click-to-WhatsApp (CTWA) lead capture

No separate Meta API integration — ad-originated leads arrive as normal inbound WhatsApp messages, tagged with a `referral` object on the first message (`source_id`, `headline`, `ctwa_clid`). Requires "Ads attribution" enabled in the WhatsApp Business Account settings, off by default.

- On a new lead whose first message carries this referral data: tag the CRM record with the specific ad/campaign source, and reference the ad's headline directly in the first reply.
- Attribution is first-touch: if the same person later clicks a different ad, keep the original ad as their recorded source rather than overwriting it (a stated assumption, not an explicit requirement — revisit if it turns out to matter).
- The Reporting agent breaks down lead counts by this same ad/campaign field — see `03-agents/reporting-agent.md`.

## Invoice/payment reminders

Sent through this agent over WhatsApp, not email — triggered by Twenty's native workflow engine calling out to this agent when a reminder condition fires (see `05-features.md` and `04-data-model.md` for the Invoice object itself).

## Failure handling

If the WhatsApp Business API itself is down or rate-limited mid-send: retry automatically with backoff. If retries are exhausted, notify the founder via Telegram rather than silently dropping the message.

## Memory and self-learning

- **Memory**: long-term, tied to the ongoing client/lead relationship — this agent should remember prior conversation context, not just the current message.
- **Self-learning**: human-approved only, and treated more conservatively here than in any other agent. Tone or behavior change suggestions are logged for manual review, never applied automatically under any circumstance — this is the one agent whose mistakes reach a real person directly, with no internal buffer.

## Testing before going live

The founder's own plan: at least one week of manual testing with a tester before this agent touches real leads (leads won't arrive from day one regardless, so this window exists naturally). That test week should specifically include: a Tanglish message, a pricing question (to confirm escalation actually fires), and a message from a number with no existing CRM record (to confirm new-lead creation works) — not just clean English test messages, which wouldn't catch the failure modes that actually matter here.