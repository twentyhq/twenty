# Email composer recipients rework: decisions and tradeoffs

Working notes for the To/Cc/Bcc field rebuild. To be deleted before opening the PR.

## Model

- A recipient token is `{ address, displayName? }`. Person / workspace member are never stored in
  composer state; they are resolved live from the address at render time, mirroring how
  `MatchParticipantService` links `messageParticipant.handle` to `personId` / `workspaceMemberId`
  on the receive side. Entities appear at the edges (autocomplete in, chip display out); state,
  dedupe, validation and send operate on addresses only.
- Send path unchanged: `SendEmailInput.to/cc/bcc` stay comma-separated bare addresses. Display
  names are presentation only for now (see Deferred).

## Decisions

- **New dependency `addressparser@1.0.1` in twenty-front** (+ `@types/addressparser` dev). Same
  package and version the server already uses to parse incoming mail headers
  (`safe-parse-email-addresses.util.ts`), so pasted `Name <email>` lists parse with identical
  semantics on both sides. It is a tiny dependency-free tokenizer, browser safe. Hand-rolling an
  RFC 5322 parser was rejected as bug-prone.
- **Dedicated field component instead of patching `FormMultiTextFieldInput`**. The Tiptap-based
  tag editor is shared with workflow form inputs; recipient UX (dedupe, validation, editing,
  autocomplete, person chips) is email-specific. Plain controlled input + chip list, no Tiptap:
  there is no rich text here, and ProseMirror atom nodes were the reason chips could not be
  edited or given menus.
- **Commit triggers**: Enter, Tab, comma, semicolon, blur. Space commits only when the current
  buffer is already a valid email (Gmail's rule), so display names with spaces stay typable.
  The old editor committed on every space, which made `First Last <email>` impossible to type.
- **Dedupe** is case-insensitive on the trimmed address, per field, applied on every add path
  (typing, paste, autocomplete pick). Adding a duplicate flashes the existing chip.
- **Validation** with the shared zod `emailSchema` (same one `EmailsFieldInput` uses) at commit
  time. Invalid entries become red (danger) chips and block send; previously invalid addresses
  were only rejected by the backend after clicking Send.

## Tradeoffs

- Person resolution matches on `emails.primaryEmail` only (case-insensitive, via `in` filter).
  `additionalEmails` is a JSONB array and not filterable through the GraphQL filter API today;
  the server-side matcher checks additional emails too, so a chip may show as plain address even
  though the send will still link to the person via participant matching. Acceptable for v1.
- (running list, updated as implementation progresses)

## Deferred (out of scope for this PR)

- Display names on the wire (`Name <email>` in outbound headers) - needs `SendEmailInput` /
  `EmailComposerService.validateEmails` changes on the server.
- Drag chips between To/Cc/Bcc.
- Collapse-on-blur to one line with "+N others" summary.
- Frequency/recency ranking of suggestions from `messageParticipant` aggregates.
- Auto-suggest "create person" for frequently emailed unknown addresses (contact auto-creation
  already covers most of this post-send via `contactAutoCreationPolicy`).
