# v2.24.0 release demos

Specs live in `packages/twenty-e2e-testing/demos/twenty-v2.24.0/` and run against a
local seeded instance:

```
npx playwright test --config demos/twenty-v2.24.0/playwright.config.ts --project=demo
```

The demo directory carries its own Playwright config so the shared
`playwright.config.ts` and the real test suite stay untouched.

## Highlight 1 — PR #23023

**Status:** demoed
**Spec:** packages/twenty-e2e-testing/demos/twenty-v2.24.0/01-drag-widgets-across-tabs.spec.ts
**Screenshot:** packages/twenty-e2e-testing/demos/twenty-v2.24.0/captures/01-drag-widgets-across-tabs/
**Video:** packages/twenty-e2e-testing/demos/twenty-v2.24.0/videos/01-drag-widgets-across-tabs.webm
**What the demo shows:** On a company record in Layout customization mode, the Fields
section is dragged out of the pinned left column and dropped into the Files tab, with a
blue line marking where it will land; switching to Timeline and back confirms the widget
now belongs to the Files tab.

## Highlight 2 — PR #23089

**Status:** skipped
**Reason:** The key-value store is only reachable through the metadata GraphQL API with an
`APPLICATION_ACCESS` token and through `kv.get/set/delete` in `twenty-sdk/logic-function`.
There is no screen anywhere in the product that reads or writes these entries; the PR lists
front-end access as a follow-up. Anything filmed would be a terminal or a GraphQL client,
which shows the API rather than the feature.

## Highlight 3 — PR #23071

**Status:** demoed
**Spec:** packages/twenty-e2e-testing/demos/twenty-v2.24.0/03-record-board-drag-and-drop.spec.ts
**Screenshot:** packages/twenty-e2e-testing/demos/twenty-v2.24.0/captures/03-record-board-drag-and-drop/
**Video:** packages/twenty-e2e-testing/demos/twenty-v2.24.0/videos/03-record-board-drag-and-drop.webm
**What the demo shows:** On the Opportunities "By Stage" board, a card is dragged from New
into Proposal — a clone follows the cursor while the board previews the exact slot it will
drop into — and then three selected cards are moved to Meeting in one drag, carried as a
single clone with a "3" chip; column totals update after each drop.

Covers the record board half of the PR only. The record calendar half is not shown: this
seed has no calendar view on any object, and building one first would have made the clip
mostly view configuration.

## Highlight 4 — PR #23069

**Status:** skipped
**Reason:** The fix is the removal of blank frames — a loader instead of an empty step
before the plan/payment screen, and a skeleton instead of an empty page after the welcome
animation. Both are sub-second transitions, and what a viewer would see is the absence of
something they never saw in the first place; showing it honestly needs a v2.23.0 recording
side by side, which this single checkout cannot produce. The one durable screen the PR adds
is the retryable error state on a failed `ListPlans` query, but that needs billing enabled
(off in this instance) plus a forced query failure, so the clip would be a staged failure
rather than the journey the release note describes.

## Highlight 5 — PR #23137

**Status:** skipped
**Reason:** Entirely in the server-side message import path: header extraction in the Gmail,
IMAP, Microsoft and inbound-email drivers, a new `isBulkMail` header check, and a per-
participant group-address check at contact creation. Reaching it needs a connected mailbox
and a real sync, and the result is that contacts are *not* created — an absence in the
People list that no viewer could attribute to this change.
