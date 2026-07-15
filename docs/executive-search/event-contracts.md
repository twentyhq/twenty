# Event Contracts

## Purpose

Define the versioned envelope, event catalog, status maps, idempotency, ordering, correction, payload minimization, and failure semantics for all cross-system synchronization events.

This contract is **approved** (not a proposed ADR). PR3 will choose concrete entities within this contract. It is distinct from Twenty analytics event envelopes and generic workspace webhooks.

## Versioned envelope

See `contracts/external-sync-event.schema.json` for the JSON Schema. Key fields:

| Field              | Type               | Required | Description                                   |
| ------------------ | ------------------ | -------- | --------------------------------------------- |
| `eventId`          | string             | Yes      | Unique event identifier                       |
| `eventType`        | string             | Yes      | Event type from catalog below                 |
| `eventVersion`     | integer            | Yes      | Envelope version (currently 1)                |
| `sourceSystem`     | DIRECTUS \| TWENTY | Yes      | Originating system                            |
| `sourceCollection` | string             | Yes      | Source collection name                        |
| `sourceRecordId`   | string             | Yes      | Source record identifier                      |
| `sourceUpdatedAt`  | string             | Yes      | Source last-updated timestamp                 |
| `sourceHash`       | string?            | No       | Content hash for change detection             |
| `workspaceKey`     | string             | Yes      | Target workspace identifier                   |
| `correlationId`    | string             | Yes      | Cross-event correlation                       |
| `causationId`      | string?            | No       | What caused this event (echo prevention)      |
| `idempotencyKey`   | string             | Yes      | Dedup key                                     |
| `occurredAt`       | string             | Yes      | When the event occurred                       |
| `actor`            | object?            | No       | USER/APPLICATION/SYSTEM/CANDIDATE/CLIENT + id |
| `changedFields`    | string[]?          | No       | Which fields changed                          |
| `payload`          | object?            | No       | Redacted, minimized payload                   |

## Processing rules

1. **Persist inbound event receipt before processing.**
2. **Deduplicate** by event ID and idempotency key.
3. **Validate schema version** — reject unknown versions safely.
4. **Fetch authoritative record** when payload completeness is uncertain.
5. **Process through a queue** — never inline.
6. **Bounded retries** — then dead-letter.
7. **Persist dead-letter state** with inspection/replay capability.
8. **Support replay** — reprocess from ledger without duplicating.
9. **Prevent echo loops** — retain causation and source; never re-process an event originating from the target system.
10. **Apply field ownership before every write** — no uncontrolled last-write-wins.
11. **Record before/after hashes.**
12. **Redact secrets, medical information, restricted demographics, and full candidate documents** from event payloads.

## Inbound event catalog (Directus → Twenty)

| Event type                            | Source collection                 | Trigger                                     |
| ------------------------------------- | --------------------------------- | ------------------------------------------- |
| `executive.created`                   | executives                        | New executive registered                    |
| `executive.updated`                   | executives                        | Profile facets updated                      |
| `executive_board_experience.updated`  | executive_board_experience        | Board service updated                       |
| `executive_board_preferences.updated` | executive_board_preferences       | Preferences updated                         |
| `application.submitted`               | applications                      | Application submitted                       |
| `application.updated`                 | applications                      | Application updated                         |
| `application.withdrawn`               | applications                      | Application withdrawn                       |
| `candidate_file.added`                | applications_files                | Candidate file added                        |
| `information_request.answered`        | application_information_request   | Candidate answered request                  |
| `availability.submitted`              | executive_availability_responses  | Availability submitted                      |
| `interview.confirmed`                 | scheduled_interviews              | Interview confirmed                         |
| `interview.cancelled`                 | scheduled_interviews              | Interview cancelled                         |
| `reference_request.state_changed`     | application_reference_requests    | Request delivery/open/submission/revocation |
| `reference_submission.created`        | application_reference_submissions | Reference submitted                         |
| `ai_consent.changed`                  | ai_ads_acceptance                 | Candidate AI consent changed                |
| `ai_contest.submitted`                | user_contest_ai_score             | Candidate contest submitted                 |
| `privacy.dnc_changed`                 | executives / executive_settings   | Do-not-contact or privacy state             |
| `retention.action`                    | retention_action_log              | Retention action affecting synced data      |

## Outbound event catalog (Twenty → Directus)

| Event type                         | Target                          | Trigger                              |
| ---------------------------------- | ------------------------------- | ------------------------------------ |
| `company.projection_updated`       | companies                       | Approved public projection changed   |
| `opportunity.published`            | opportunities                   | Assignment published to portal       |
| `opportunity.updated`              | opportunities                   | Published position updated           |
| `opportunity.paused`               | opportunities                   | Position paused                      |
| `opportunity.closed`               | opportunities                   | Position closed                      |
| `candidate_status.visible_changed` | applications                    | Candidate-visible status updated     |
| `information_request.created`      | application_information_request | Twenty requests info from candidate  |
| `availability_poll.created`        | interview_scheduling_polls      | Availability request created         |
| `interview.created`                | scheduled_interviews            | Interview scheduled                  |
| `interview.updated`                | scheduled_interviews            | Interview rescheduled                |
| `interview.cancelled`              | scheduled_interviews            | Interview cancelled                  |
| `reference_request.initiated`      | application_reference_requests  | Twenty initiates reference request   |
| `placement.outcome`                | applications                    | Candidate-visible placement outcome  |
| `dossier.published`                | executive_opportunity_dossiers  | Candidate-approved dossier published |

Field-dependent payload contracts remain `DRAFT_BLOCKED_PENDING_SCHEMA_SNAPSHOT` until verified Directus schema evidence exists.

## Status maps

Each Directus status string is converted through an explicit, versioned map. Unknown statuses fail safely to a neutral state (never to a progression or rejection). Every status map records:

- Source status string
- Target Twenty status
- Map version
- Unknown behavior (safe failure)
- Whether the status is candidate-visible

## Never synced to candidate portal

- Internal research notes and target-company universe (unless explicitly public)
- Hidden sources/referrers
- Client confidential notes and feedback (not approved for candidate)
- Search-firm commercial terms, fees, invoices, revenue, credits
- Off-limits details and conflict investigation
- Internal ranking/ordering
- Unreviewed AI
- Restricted references and diligence
- Other candidates' data
- Subscription-selection firewall audit data
- Internal staff performance metrics
