# Changelog

## 1.5.0

- Add a settings panel with a "Run backfill" button, so the backfill can be re-run on demand instead of only on install. The button posts to a new `POST /last-contact/backfill` route, which enqueues the same count-and-fan-out job the post-install hook runs.
- Report the running backfill in that panel, with a progress ring and a count of the batch jobs as the queue works through them. Each run records its job ids, and `GET /last-contact/backfill/status` reads their queue state: `getJobs` refuses more than 200 ids at a time, so a run is read in pages, and a job the queue has already dropped counts as finished rather than stalling the count short of the total. The panel polls every three seconds while a run is in flight and stops once it settles, because each poll spends an application API call per 200 jobs against a budget shared by every workspace on the instance.

## 1.4.0

- Write a whole batch of records in one API call instead of one call per record. The application API rate limit is consumed once per operation and `updateMany` applies a single payload to everything it matches, so writing one timestamp per person, company or opportunity cost one call each: a full 200-event batch spent 435-585 calls against a budget of 500 per minute shared by every workspace on the instance. Reads are batched the same way, and each handler now costs about nine calls. The recency guard that used to be a filter on the update moved into the read that precedes it, and a record the read does not return is left out of the write rather than upserted back.
- Resolve every company's most recently contacted person by scanning the batch's people ordered by contact recency and keeping the first row each company produces, instead of one indexed lookup per company. One page settles the whole batch in the common case; the scan is capped so a single company with a long contact history cannot page through all of it to reach the others, and whatever the cap leaves unresolved falls back to one lookup each.
- Retry the calendar cron's own queries, which bypassed the retry helper.
- Raise the default backfill batch size to 200 now that a batch is written in one call.

## 1.3.0

- Run every database-event trigger in batch mode. A mailbox sync emits one `messageParticipant.updated` event per synced message, which used to enqueue one job per event and flood the workers; a batch now arrives as a single job. Each handler folds its batch down to the distinct records it has to touch (one update per person, company or opportunity, not one per event). Messages, meetings and opportunities are then resolved with `in` queries over the whole batch. The company recompute still runs one indexed lookup per company: finding a company's most recently contacted person cannot be batched without scanning all of its people.
- Resolve a calendar interaction from the participant's own calendar event instead of re-querying the person's most recent past meeting. Participants linked to a future event are left to the `on-calendar-event-started` cron, as before.
- Require Twenty `>=2.40.0`: batch mode for database event triggers only exists from 2.40.

## 1.2.4

- Limit the app role to reading synced messages, calendar events, and their participants, and to reading and updating people, companies, and opportunities. The app no longer requests read and edit access to every record type.

## 1.2.3

- Rework the last-contact backfill into a single fan-out instead of a logic function that called its own HTTP route in a loop with blocking sleeps. On install it counts people, opportunities and companies and enqueues one job per record batch via `enqueueJob`. Each job receives its batch id and processes the matching record window (offset pagination). Jobs are staggered with `delayMs` to stay under the hosted API rate limiting.

## 1.2.0

- Compute last contact on Companies and Opportunities when the record or its relationships change, not only on new interactions: opportunities recompute from their point of contact on creation and when it changes, and companies recompute from their people on creation and when a person joins or leaves.
- Rework the last-contact backfill into a sequential, cursor-paginated process orchestrated through the kv-store (people, then opportunities, then companies). Each run handles one batch and hands the next cursor back to the orchestrator, which pauses between runs to stay under the hosted API rate limiting. Batch size and pause are server variables.

## 1.1.3

- Stop declaring INDEX view fields explicitly: the server now provisions the INDEX view column for each app field automatically, so the manifest no longer targets the engine-owned standard INDEX views.
- Require Twenty `>=2.26.0`: the engine-owned INDEX view fields this version relies on only exist from 2.26.

## 1.1.1

- Throttle backfill updates and retry rate-limited or transient API failures with exponential backoff, so install/upgrade no longer fails behind Cloudflare rate limiting.

## 1.1.0

- Add last contact on Companies and Opportunities.
- Set last-contact fields readonly.

## 1.0.0

- Initial release: "Last contact by" and "Last contact item" tracking on People, powered by calendar and message sync.
