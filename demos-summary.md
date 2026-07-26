# Twenty v2.24.0 release demos

Two of the five highlights have a visual surface worth recording. The other
three are backend or fix-a-blank-frame changes with nothing a viewer could
point at.

## How to run

The shared `packages/twenty-e2e-testing/playwright.config.ts` scopes `testDir`
to `./tests`, so `npx nx test twenty-e2e-testing demos/...` finds no tests. The
demo specs ship with their own config that widens discovery and turns on video:

```bash
cd packages/twenty-e2e-testing
npx playwright test --config demos/twenty-v2.24.0/playwright.demos.config.ts
```

Notes on this machine: `demos/twenty-v2.24.0/login.demos.setup.ts` replaces
`tests/login.setup.ts` because the seeded instance signs straight into the Apple
workspace instead of showing a workspace picker, and the config pins
`executablePath` to the preinstalled `/opt/pw-browsers/chromium` because the
browser build Playwright 1.60 wants cannot be downloaded here.

## Highlight 1 — PR #23023

**Status:** demoed
**Reason:** n/a
**Spec:** `packages/twenty-e2e-testing/demos/twenty-v2.24.0/01-drag-widget-across-record-page-tabs.spec.ts`
**Screenshot:** `packages/twenty-e2e-testing/demos/twenty-v2.24.0/screenshots/01-03-drop-line-in-destination-tab.png` (and `01-01`, `01-02`, `01-04` in the same directory)
**Video:** `packages/twenty-e2e-testing/demos/twenty-v2.24.0/run_results/demos-twenty-v2.24.0-01-dr-e5a28-nto-another-record-page-tab-demos/video.webm`
**What the demo shows:** On a company record in layout edit mode, the
Opportunities widget is dragged out of the pinned left column and dropped into
the Timeline tab, with a blue drop line marking where it will land and the
widget ending up in the tab it was dropped into.

## Highlight 2 — PR #23089

**Status:** skipped
**Reason:** Key-value storage scoped per app installation is an SDK and GraphQL
API, reachable only from app code or a GraphQL client. It has no screen.

## Highlight 3 — PR #23071

**Status:** demoed
**Reason:** n/a
**Spec:** `packages/twenty-e2e-testing/demos/twenty-v2.24.0/03-record-board-dnd-kit-drag-and-drop.spec.ts`
**Screenshot:** `packages/twenty-e2e-testing/demos/twenty-v2.24.0/screenshots/03-03-hovering-target-column.png` (and `03-01`, `03-02`, `03-04` in the same directory)
**Video:** `packages/twenty-e2e-testing/demos/twenty-v2.24.0/run_results/demos-twenty-v2.24.0-03-re-279ca-agged-from-New-to-Screening-demos/video.webm`
**What the demo shows:** On the Opportunities "By Stage" board, a card is
dragged from the New column into Screening, with a clone following the cursor, a
drop line showing the landing slot, and both column totals updating after the
drop.

## Highlight 4 — PR #23069

**Status:** skipped
**Reason:** The change is the absence of blank frames during onboarding. Two of
the three fixed spots (the plan/payment step and its retryable error state) only
render on an instance with billing configured, which the seeded dev instance is
not; the third is a skeleton visible for a fraction of a second between the
welcome animation and the workspace. Filming "no blank page" would produce a
capture indistinguishable from any normal sign-in.

## Highlight 5 — PR #23137

**Status:** skipped
**Reason:** Group-address and bulk-mail detection runs in the messaging import
pipeline on `List-Unsubscribe`, `List-Id`, `Precedence` and `Auto-Submitted`
headers. Showing it would mean connecting a real mailbox and comparing which
contacts do not get created — an absence, and not one the UI attributes to this
change.
