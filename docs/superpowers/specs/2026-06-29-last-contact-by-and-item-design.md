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

### `lastContactBy` — ACTOR (nullable)

`ACTOR` composite value set to:

- `source`: `'EMAIL'` or `'CALENDAR'`
- `workspaceMemberId`: the team member who was on the interaction
- `name`: that member's display name (`"<firstName> <lastName>"`)
- `context`: `{}` — **no `provider`**

Renders as an actor chip (member name + avatar) with an email/calendar source
indicator.

**Why no provider logo:** the Gmail/Outlook logo on the cover came from
`connectedAccount`, which v2.7
(`2-7-...-drop-connected-account-standard-object.command.ts`) removed from the
workspace schema. `messageChannel.connectedAccountId` / `calendarChannel.connectedAccountId`
remain as dangling UUIDs with no app-queryable target, so provider is not
reachable from an app. Decision (confirmed with user): ship the team-member
actor without the provider logo.

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

- Two `MORPH_RELATION` field definitions on Person, **sharing one `morphId`**:
  - target `message` (universalIdentifier `20202020-3f6b-4425-80ab-e468899ab4b2`)
  - target `calendarEvent` (universalIdentifier `20202020-8f1d-4eef-9f85-0d1965e27221`)
  - each `MANY_TO_ONE`, `onDelete: SET_NULL`, its own join column.
- A reverse `RELATION` (ONE_TO_MANY) field on each of `message` and
  `calendarEvent` pointing back to Person (expected side effect: those records
  gain a "last contact for" relation in their detail view).

Renders as a clickable record chip showing the email `subject` / event `title`
with the object's icon.

## Atomic consistency

The shared updater becomes "set all three together if this interaction is
newer". Replace `updatePersonLastContactAtIfNewer(client, personId, lastContactAt)`
with an updater that also takes the actor value and the morph target
(`{ type: 'message' | 'calendarEvent', id }`), and writes all three fields in a
single `updatePeople` mutation guarded by the same
`id == personId AND (lastContactAt IS NULL OR lastContactAt < new)` filter that
exists today. This keeps the "newer wins" race-safety and guarantees the three
columns never describe different interactions.

## Trigger changes

Each trigger gains the work to gather the actor + item alongside the timestamp,
then calls the new shared updater.

- **on-email-interaction**: query the message for `subject`, `receivedAt`, and
  its `messageParticipants` (role, `workspaceMemberId`, `workspaceMember.name`).
  Build actor + item `{ type: 'message', id: messageId }`.
- **on-calendar-interaction** / **on-calendar-event-started**: query the
  calendarEvent for `title`, `startsAt`, `isCanceled`, and its
  `calendarEventParticipants` (isOrganizer, `workspaceMemberId`,
  `workspaceMember.name`). Build actor + item `{ type: 'calendarEvent', id }`.
  The cron path keeps its existing "started within interval" selection.
- **backfill**: the in-memory "latest per person" map tracks, per person, the
  winning `{ contactedAt, actor, item }` rather than just the timestamp; the
  final write sets all three fields. Paginated reads add the participant and
  subject/title selections.

## View

All People view, columns in cover order: **Last contact by** · **Last contact**
· **Last contact item**. Keep the existing `lastContactAt` view field; add view
fields for `lastContactBy` and `lastContactItem` and set positions/sizes so the
three sit together.

## Constants / identifiers

Add new UUID v4 universal identifiers in
`src/constants/universal-identifiers.ts` for: `lastContactBy` field + its view
field; the two `lastContactItem` morph fields + the shared `morphId` + the two
reverse fields on message/calendarEvent; the `lastContactItem` view field.

## Implementation risks / spikes

1. **Writing a morph relation via the workspace GraphQL mutation (load-bearing).**
   No app in the repo writes a morph relation yet. Before building the triggers,
   spike how `updatePeople` accepts a morph target — likely a per-target join
   column (e.g. `lastContactItemMessageId` / `lastContactItemCalendarEventId`)
   set to the record id, or a polymorphic connect input. Confirm both write and
   read (the cell must resolve to the linked record) work through `CoreApiClient`.
   **Fallback if morph is not writable from an app:** two nullable single
   `RELATION` fields (`lastContactMessage`, `lastContactCalendarEvent`), only one
   set at a time, surfaced through a single view column if possible. This changes
   the field shape but preserves the clickable-record UX; revisit with the user
   if the spike fails.
2. **Actor write shape.** Confirm the `updatePeople` mutation accepts the ACTOR
   composite (`source`/`workspaceMemberId`/`name`/`context`) for a custom app
   field, matching how standard actor fields are written.

## Testing

Follow the app's existing vitest setup (unit tests per util/logic function +
the integration test). Cover: newer-wins still holds across all three fields;
actor resolution picks the right participant and degrades to null when no team
member is present; item points at the correct object type for email vs calendar;
backfill writes all three consistently.

## Out of scope

- Provider (Gmail/Outlook) logo on `lastContactBy`.
- Any change to how `lastContactAt`'s "newer wins" semantics work beyond
  extending the payload.
