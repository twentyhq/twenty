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

- Person resolution matches on `emails.primaryEmail` only, case-insensitively via per-address
  `ilike` filters (no `%` wildcards, `%_\` escaped). `additionalEmails` is a JSONB array and not
  cleanly filterable through the GraphQL filter API today; the server-side matcher checks
  additional emails too, so a chip may show as a plain address even though the send still links
  to the person via participant matching. Acceptable for v1.
- `EmailsFilter` existed in twenty-shared but was missing from the `LeafFilter` union, so no
  frontend code could filter on `emails.primaryEmail`. Added it to the union (safe, additive).
- Chip flash-on-duplicate replays its CSS animation by remounting the chip subtree (nonce in the
  React key). Chosen over animation-restart hacks (forced reflow); the remount is invisible.
- Keyboard chip selection keeps DOM focus on the input and tracks a virtual `selectedChipIndex`
  (aria-activedescendant), instead of roving focus across chips. One focus point, no focus
  juggling, standard combobox listbox pattern.
- `flushSync` (precedent: `Dropdown.tsx`) is used to focus + place the caret in the input right
  after entering chip-edit mode. The alternative was a useEffect on editing state, which the
  house rules forbid.
- Suggestion rows call `event.preventDefault()` on mousedown so picking a suggestion never blurs
  the input (blur would commit the half-typed buffer as a junk chip first).
- Cmd/Ctrl+Enter with a non-empty buffer commits the buffer but does not send in the same
  keystroke: the send hotkey handler holds a same-render closure over composer state, so sending
  in the same event would read the pre-commit recipients. Pressing it again sends. Gmail commits
  and sends in one stroke; doing that here needs the send path to read live state.
- Enter with the suggestions open picks the highlighted (or top) suggestion, Gmail-style. When
  the typed buffer is itself a valid email, the literal "Use this email" row is ranked first so
  Enter keeps meaning "add what I typed".
- Suggestions are disabled while editing a chip (the edit buffer holds "Name <email>" text,
  which makes a poor search query).
- Dedupe blocks within a field; across fields duplicates are allowed when typed (sometimes
  intentional), but suggestions exclude addresses already present in any of To/Cc/Bcc.
- The reply composer (EmailThreadComposer) gets no context record: its widget target record is
  the message thread, not a person/company, and replies already prefill participants.
- If two people share a primary email, the last fetched match wins for chip display (no
  ambiguity UI). Rare enough to not warrant the extra state.
- "Add as person" splits the display name on the first space for firstName/lastName. Same
  heuristic the contact-creation manager uses server-side.

## Deferred (out of scope for this PR)

- Display names on the wire (`Name <email>` in outbound headers) - needs `SendEmailInput` /
  `EmailComposerService.validateEmails` changes on the server.
- Drag chips between To/Cc/Bcc.
- Collapse-on-blur to one line with "+N others" summary.
- Frequency/recency ranking of suggestions from `messageParticipant` aggregates.
- Auto-suggest "create person" for frequently emailed unknown addresses (contact auto-creation
  already covers most of this post-send via `contactAutoCreationPolicy`).
