# Last contacted at

A [Twenty](https://twenty.com) official application that adds a `lastContactAt` field to the standard Person object and keeps it in sync with email and calendar activity.

## What it does

- Adds a **Last Contact** (`lastContactAt`, `DATE_TIME`) field on Person, visible in the All People view.
- Sets the field to the most recent interaction whenever a synced email or calendar event is linked to a person.
- Counts a meeting as contact when it starts, via a cron-triggered logic function.
- Backfills the field from existing message and calendar history right after install.

### Application variables

| Variable | Default | Description |
| --- | --- | --- |
| `CALENDAR_CRON_INTERVAL_MINUTES` | `5` | Interval between runs of `on-calendar-event-started`. The cron scans events that started within the last interval plus a 5-minute safety overlap. |


## Learn more

- [Twenty Apps documentation](https://docs.twenty.com/developers/extend/apps/getting-started/quick-start)
- [twenty-sdk CLI reference](https://www.npmjs.com/package/twenty-sdk)
- [Discord](https://discord.gg/cx5n4Jzs57)
