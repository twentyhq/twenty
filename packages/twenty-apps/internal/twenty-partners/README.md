# Twenty Partners

Turns the CRM into the operating system for the Twenty partner program: intake partner-eligible deals, match them to vetted marketplace partners, and track the matching pipeline end-to-end.

## What's inside

- **Partner object** — slug, status, availability, served geographies, languages spoken, deployment expertise, Calendly link, and last-match timestamp.
- **Opportunity extensions** — match status, design-doc status, intro and relance timestamps, and a relation to the matched partner.
- **Automatic matching** — when an opportunity is set to auto-match, the longest-idle available partner is assigned and the deal is marked matched; if none is available it is handed off for manual matching with an explanatory note.
- **Views** — a waiting-for-match queue, a matching-funnel overview grouped by status, the partner index, and a log of matched deals, all surfaced in the sidebar.

## Match status pipeline

`matchStatus` follows the deal lifecycle:

| Status | Meaning |
| --- | --- |
| `TO_BE_MATCHED` | Default — deal entered, awaiting assignment |
| `MANUAL_MATCH` | Needs a human to pick a partner |
| `AUTO_MATCH` | Triggers automatic partner assignment |
| `MATCHED` | Partner assigned |
| `INTRODUCED_TO_A_PARTNER` | Customer intro sent |
| `WORKING_WITH_A_PARTNER` | Engagement underway |
| `IMPLEMENTING` | Active implementation |
| `WON` | Deal closed won |
| `RECONNECT_LATER` | Paused — reconnect in future |
| `LOST` | Deal closed lost |
