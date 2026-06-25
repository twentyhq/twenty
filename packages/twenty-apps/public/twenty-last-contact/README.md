# Last contacted at

A [Twenty](https://twenty.com) official application that adds a `lastContactAt` field to the standard Person object and keeps it in sync with email and calendar activity — answering the question every CRM should answer instantly: *when did we last talk to this person?*

## Why teams install it

- **Zero manual logging** — every synced email and calendar meeting updates the field automatically, in real time.
- **Useful from minute one** — on install, your entire email and meeting history is backfilled. No empty columns, no waiting.
- **Spot cold relationships instantly** — sort or filter any People view by Last Contact to build follow-up lists in seconds.
- **Meeting-aware** — a meeting counts as contact the moment it starts, not whenever someone remembers to update the CRM.

## What it does

- Adds a **Last Contact** (`lastContactAt`, `DATE_TIME`) field on Person, visible in the All People view.
- Sets the field to the most recent interaction whenever a synced email or calendar event is linked to a person.
- Counts a meeting as contact when it starts, via a cron-triggered logic function.
- Backfills the field from existing message and calendar history right after install.

No setup, no configuration — install it, open People, and you immediately know who needs a follow-up.

### Application variables

| Variable | Default | Description |
| --- | --- | --- |
| `CALENDAR_CRON_INTERVAL_MINUTES` | `5` | Interval between runs of `on-calendar-event-started`. The cron scans events that started within the last interval plus a 5-minute safety overlap. |
