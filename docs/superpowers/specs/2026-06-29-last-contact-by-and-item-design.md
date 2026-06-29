# Last contact by + Last contact item — Design

App: `packages/twenty-apps/public/twenty-last-contact`
Date: 2026-06-29

## Goal

Extend the Last Contact app from a single `lastContactAt` date column to the
three-column experience shown in `public/gallery/cover.png` on the All People
view:

1. **Last contact by** — who on your team last interacted with the person.
2. **Last contact** — when (the existing `lastContactAt` field, unchanged).
3. **Last contact item** — the email or meeting that was the last contact,
   as a clickable record.

All three columns always describe the **same single most-recent interaction**.

## Current state (what already exists)

- Field `lastContactAt` (`DATE_TIME`) on Person + its view field.
- Triggers that keep it current, all funneling through
  `updatePersonLastContactAtIfNewer` (conditional "set if newer"):
  - `on-email-interaction` — `messageParticipant.updated` (personId set)
  - `on-calendar-interaction` — `calendarEventParticipant.updated` (personId set)
  - `on-calendar-event-started` — cron, meetings that just started
  - `backfill-last-contact-at` — post-install bulk fill from history

## New fields on Person

### `lastContactBy` — RELATION → workspaceMember (MANY_TO_ONE, nullable)

A `RELATION` (MANY_TO_ONE) from Person to `workspaceMember`, named `lastContactBy`:

- Join column `lastContactById`; written via `updatePeople(data: { lastContactById })`.
- Reverse `RELATION` (ONE_TO_MANY) field on `workspaceMember` (e.g.
  `lastContactForPeople`) pointing back to Person.
- Renders as a member chip (avatar + name), clickable, always current with the
  member's name.

**Why a RELATION and not ACTOR (original plan):** the ACTOR composite's
`workspaceMemberId` and `name` sub-fields are `hidden: 'input'` — the GraphQL
create/update input generators skip them
(`composite-field-metadata-{create,update}-gql-input-type.generator.ts`,
`actor.composite-type.ts`). The server stamps those from the *caller's*
identity, so an app-written ACTOR would always show the application itself, not
the team member. A MANY_TO_ONE relation to `workspaceMember` is the writable
primitive that yields the same member-chip UX. Decision confirmed with user.

**Why no provider logo:** the Gmail/Outlook logo on the cover came from
`connectedAccount`, which v2.7
(`2-7-...-drop-connected-account-standard-object.command.ts`) removed from the
workspace schema. `messageChannel.connectedAccountId` / `calendarChannel.connectedAccountId`
remain as dangling UUIDs with no app-queryable target, so provider is not
reachable from an app. A `workspaceMember` relation needs none of this.

**Resolving the team member:** the interaction's participants carry the link.
Both `messageParticipant` and `calendarEventParticipant` have
`workspaceMember` + `workspaceMemberId`. Among an interaction's participants,
the one with `workspaceMemberId` set is the team member.

- Email: prefer the `from` participant if it is a workspace member; otherwise
  the first participant with a `workspaceMemberId`.
- Calendar: prefer the organizer (`isOrganizer: true`) if a workspace member;
  otherwise the first participant with a `workspaceMemberId`.
- If no participant has a `workspaceMemberId`, leave `lastContactBy` null but
  still set `lastContactAt` and `lastContactItem`.

### `lastContactItem` — MORPH_RELATION (MANY_TO_ONE → message | calendarEvent)

Morph authoring follows the SDK pattern used by `attachment` / `noteTarget` /
`taskTarget` (see `get-default-relation-object-fields.ts` and
`entity-field-template.ts`):

- Two `MORPH_RELATION` field definitions on Person, **sharing one `morphId`**
  (no single "parent" field exists — confirmed against `noteTarget`, which has
  only per-target `targetPerson`/`targetCompany`/`targetOpportunity` fields):
  - `lastContactItemMessage` → `message`
    (universalIdentifier `20202020-3f6b-4425-80ab-e468899ab4b2`),
    join column `lastContactItemMessageId`.
  - `lastContactItemCalendarEvent` → `calendarEvent`
    (universalIdentifier `20202020-8f1d-4eef-9f85-0d1965e27221`),
    join column `lastContactItemCalendarEventId`.
  - each `MANY_TO_ONE`, `onDelete: SET_NULL`.
- A reverse `RELATION` (ONE_TO_MANY) field on each of `message` and
  `calendarEvent` pointing back to Person (expected side effect: those records
  gain a "last contact for" relation in their detail view). Each morph field's
  `relationTargetFieldMetadataUniversalIdentifier` points at its reverse field.

**Write** (confirmed feasible via workspace GraphQL): set the relevant join
column, e.g. `updatePeople(data: { lastContactItemMessageId: id })` or
`{ lastContactItemCalendarEventId: id }` — exactly one set, the other left/forced
null. **Read**: nested selection `lastContactItemMessage { id subject }` /
`lastContactItemCalendarEvent { id title }`.

Renders as a clickable record chip showing the email `subject` / event `title`
with the object's icon.

## Atomic consistency

The shared updater becomes "set all three together if this interaction is
newer". Replace `updatePersonLastContactAtIfNewer(client, personId, lastContactAt)`
with an updater that also takes the team member id (`workspaceMemberId | null`)
and the morph target (`{ type: 'message' | 'calendarEvent', id }`), mapping them
to `lastContactById` and the right `lastContactItem*Id` join column, and writes
all fields in a single `updatePeople` mutation guarded by the same
`id == personId AND (lastContactAt IS NULL OR lastContactAt < new)` filter that
exists today. This keeps the "newer wins" race-safety and guarantees the three
columns never describe different interactions.

## Trigger changes

Each trigger gains the work to gather the team member + item alongside the
timestamp, then calls the new shared updater.

- **on-email-interaction**: query the message for `receivedAt` and its
  `messageParticipants` (`role`, `workspaceMemberId`). Pick the team-member
  participant (prefer `from`, else first with a `workspaceMemberId`). Build
  `workspaceMemberId` + item `{ type: 'message', id: messageId }`.
- **on-calendar-interaction** / **on-calendar-event-started**: query the
  calendarEvent for `startsAt`, `isCanceled`, and its `calendarEventParticipants`
  (`isOrganizer`, `workspaceMemberId`). Pick the team-member participant (prefer
  organizer, else first with a `workspaceMemberId`). Build `workspaceMemberId` +
  item `{ type: 'calendarEvent', id }`. The cron path keeps its existing
  "started within interval" selection.
- **backfill**: the in-memory "latest per person" map tracks, per person, the
  winning `{ contactedAt, workspaceMemberId, item }` rather than just the
  timestamp; the final write sets all fields. Paginated reads add the participant
  selections.

Note: only the `workspaceMemberId` is needed for the relation write — the
member's name is rendered by the chip, not stored, so no FULL_NAME query is
required in the triggers.

## View

All People view, columns in cover order: **Last contact by** · **Last contact**
· **Last contact item**. Keep the existing `lastContactAt` view field.

- `lastContactBy`: one view field.
- `lastContactItem` (morph): following the standard `allNoteTargets` view, add
  **one view field per morph sub-field** — both `lastContactItemMessage` and
  `lastContactItemCalendarEvent`, at the same position. The front-end dedupes
  morph sub-fields by `morphId`
  (`dedupeMorphRelationFieldMetadataItems`) and renders them as a **single
  column**. This mirrors the proven standard pattern rather than relying on
  which sub-field "survives" dedup.

Set positions so the three logical columns sit together in cover order
(`lastContactBy`, then `lastContactAt`, then the morph pair).

## Constants / identifiers

Add new UUID v4 universal identifiers in
`src/constants/universal-identifiers.ts` for: the `lastContactBy` field + its
reverse field on `workspaceMember` + its view field; the two `lastContactItem`
morph fields + the shared `morphId` + the two reverse fields on
message/calendarEvent; the two `lastContactItem` morph view fields.

## Implementation risks / spikes

Both write paths are now confirmed against the codebase:

- **Morph write/read** — per-target join columns (`lastContactItemMessageId` /
  `lastContactItemCalendarEventId`) on `updatePeople`; nested read of
  `lastContactItemMessage`/`lastContactItemCalendarEvent`. No app writes a morph
  yet, so the first build task is a thin end-to-end check (define fields →
  `app deploy`/sync → write + read one record) before wiring the four triggers.
- **`lastContactBy` write** — plain MANY_TO_ONE relation join column
  `lastContactById`; standard relation write, well-precedented (twenty-partners).

Resolved: **how a view field references the morph column** — one viewField per
morph sub-field, deduped to a single column by the front-end (see View section),
matching the standard `allNoteTargets` view.

## Testing

Follow the app's existing vitest setup (unit tests per util/logic function +
the integration test). Cover: newer-wins still holds across all fields;
team-member resolution picks the right participant and degrades to null when no
workspace-member participant is present; item points at the correct object type
(message vs calendarEvent) for email vs calendar; backfill writes all fields
consistently.

## Out of scope

- Provider (Gmail/Outlook) logo on `lastContactBy`.
- Any change to how `lastContactAt`'s "newer wins" semantics work beyond
  extending the payload.
