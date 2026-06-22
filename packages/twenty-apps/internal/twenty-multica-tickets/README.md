## Multica Support for Twenty

Bidirectional support ticket integration between Twenty CRM and Multica.
Create and sync tickets with the Support project in the x0 workspace.

### What you get

- **Custom `Ticket` object** — title, description, status, priority, assignee, linked to People records
- **Create tickets** from AI chat, workflows, or the Create Support Ticket form
- **Update tickets** — status/priority changes in Twenty push to Multica automatically
- **Webhook receiver** — Multica issue changes sync back to Twenty (bidirectional)
- **AI agent** — triage agent classifies and prioritizes incoming tickets
- **Kanban + table views** — visual board and list view for ticket management

### Getting started

1. In Twenty, go to **Settings → Applications** and install **Multica Support**
2. Set `MULTICA_API_KEY` (your Multica PAT for the x0 workspace) in app variables
3. Set `MULTICA_WEBHOOK_SECRET` (shared secret for inbound webhook validation)
4. Start creating tickets via the command menu (`Cmd+K → Create Support Ticket`)

### Development

```bash
cd packages/twenty-apps/internal/twenty-multica-tickets
yarn lint          # Oxlint — 0 warnings, 0 errors
npx tsc --noEmit   # Type check (TS6305 project refs are non-errors)
```
