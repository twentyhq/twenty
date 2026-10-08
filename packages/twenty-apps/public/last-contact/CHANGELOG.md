# Changelog

## 1.9.0

- Drop the `on-person-created` and `on-company-created` triggers. Last contact only comes from a synced email or meeting linked to a person, so a newly created person or company never has one, and recomputing the company on creation could not change anything. A mailbox sync that creates contacts spent 6 API calls per batch of 100 contacts on them.
- Pace the backfill. Its API calls are now at least 600 ms apart, about 100 calls per minute or a fifth of the limit every install shares. It used to send them back to back, so a large workspace could use the whole limit on its own for 15 minutes. The meeting scheduling that every install and upgrade runs is paced the same way.
- Let the backfill resume instead of starting over. A run stops taking new batches after 8 minutes and enqueues itself to continue from its cursor, so a large workspace is backfilled over several runs instead of being cut off by the 900-second timeout. When the rate limit makes it give up, it continues 2 minutes later from the batch that failed, where it used to restart from the first person. This also applies to the "Trigger backfill" button.
- Compute opportunities and companies in the backfill from the last contact it just wrote on people, instead of reading every email and meeting of their people again, which more than doubled its cost. Opportunities without a contacted point of contact and companies without a contacted person are now reset to empty, as they already are when an opportunity or person changes.
- Read only the sender and team members of each email when an email is linked to a person. The other recipients never change the result, but they were read too, so a batch of emails sent to many people cost one extra call per 200 recipients. An email with neither a sender nor a team member among its participants is still counted as an inbound contact, with its date read from the message.

## 1.8.0

All installs of the app share one API rate limit, 500 calls per minute across every workspace. This version is about spending far fewer of those calls.

- **No more calendar cron.** The 5-minute cron ran in every workspace in the same minute and made at least one API call each time, even with nothing to do. With about 1500 installs, that alone used more than the limit. Meetings are now scheduled instead:
  - When a participant is linked to a meeting that has not started yet, or when a meeting's start time changes or it is un-canceled, the app enqueues one delayed job for the meeting's 5-minute slot. A meeting that has already started is applied right away instead. The job runs just after the slot ends and updates last contact for that slot's meetings. Enqueuing a job costs no API call, all meetings in a slot share one job, and a slot with no meeting linked to a person costs one call.
  - Enqueued jobs can be delayed by at most 7 days, so meetings more than 6 days out are reached through a horizon job. It runs every 3 days, schedules the meetings that came within reach, and enqueues the next run only while meetings remain further out. A workspace with no upcoming meetings runs nothing.
  - Every install and upgrade schedules the upcoming meetings and applies meetings from the last hour, so meetings linked before this version are not missed.
  - A meeting's last contact still updates within about 6 minutes of its start: the job runs 1 minute after the end of its 5-minute slot.
- **Fewer calls per email or meeting batch: at most 5 instead of 8.** A person's company and opportunities are read nested in the same query as the person, which costs no extra call. Recomputing an opportunity's last contact also reads its point of contact nested: 2 calls instead of 3.
- **Retries that respect the rate limit.** A rate-limited call now waits for the server's `retryAfterMs`, capped at 60 seconds, when it is longer than the backoff. Once a function has waited 2 minutes in total, it hands the job back to the queue to retry later, instead of failing it or holding a worker.

## 1.7.0

- Keep the app's fields off the record timeline. The app's fields are frequently rewritten during email and meeting syncs, and each write used to add an `updated Last contact` entry to the person, company or opportunity timeline, burying everything else. All 23 fields now declare `isAuditLogged: false`, so their values still update but no timeline activity is recorded for them. Entries written before this version stay on the timeline.

## 1.6.0

- Run the backfill inside the post-install function instead of enqueuing one job per record batch. The batch jobs ran on the logic function queue, which runs many jobs at once, so their API calls competed for the same rate limit. Post-install hooks run on the application lifecycle queue, one at a time, and the backfill now pages through people, then opportunities, then companies, one batch after the other, within a single 900-second run. Upgrading from 1.5.0 or earlier runs it once. The per-batch logic functions and the `LAST_CONTACT_BACKFILL_SLEEP_MS` server variable are removed.
- Add a health check that shows a warning on the app's settings page when the workspace has no synced emails or meetings, with a button to connect an account.
- Enqueue the manual backfill from the settings page with `enqueueJobs` instead of the deprecated `enqueueJob`.
- Replace deprecated SDK usages: the settings page is a front component pointed at by `defineSettingsMenuItem` instead of a `defineSettingsFrontComponent`, and the application uses `logo` and `galleryImages` instead of `logoUrl` and `screenshots`.
- Require Twenty `>=2.42.0` and move `twenty-sdk` and `twenty-client-sdk` to 2.42.0: health checks, settings menu items and the application lifecycle queue only exist from 2.42.

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
