# Reporting Agent

Read this when building or modifying the Reporting agent. Access: founder/admin only — never reachable by staff. The lowest-risk of the three founder-facing agents: read-only, no autonomous actions, nothing it does can reach an external person.

## Trigger

On-demand only. This agent does not run on a schedule and does not push anything unprompted — it answers when asked, via a query through the Controlled Tool API, and nothing else. No cron job, no recurring digest.

## Scope

- **Covers**: project/campaign status, and lead pipeline broken down by ad/campaign source (the same source field the WhatsApp agent writes on new leads — see `03-agents/whatsapp-agent.md` and `04-data-model.md`).
- **Explicitly excludes**: financials. This agent never surfaces revenue, invoice amounts, or payment data — that stays out of its scope entirely, not just de-prioritized.

## Reports to

The founder/management only — never to individual employees about their own tasks.

## Output channel

Answers appear wherever the question was asked from — Telegram or the Twenty-embedded chat widget — not both regardless of origin. If asked via Telegram, the answer goes to Telegram; if asked via the widget, the answer goes to the widget.