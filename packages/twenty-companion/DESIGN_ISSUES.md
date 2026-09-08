# Remaining design issues after Twenty UI migration

Checked on 8 September 2026 against current source, light/dark browser previews,
and the rebuilt installed macOS app. Typecheck, 83 tests, build, and packaging
passed. These tests are not a complete visual or accessibility regression suite.

## High priority

1. Finish in first-time onboarding leads to Ready and another Open my workspace
   action. The label promises completion before completion happens.
2. Navigation does not move focus to the destination heading. Browser inspection
   confirms focus returns to the document after navigating from the menu.
3. The elapsed timer is inside role=status and updates every second. Separate
   elapsed time from recording-state announcements.

## Interaction and accessibility

4. Pending commands mostly disable controls without action-specific loading
   feedback. Twenty UI supports isLoading; Companion needs pending-action state.
5. Disabled actions do not explain why they are unavailable, particularly New
   recording, Disconnect, and Recording permissions during capture.
6. Accessibility permission is required without explaining why call/speaker
   detection must block manual capture. Verify dependencies before changing this.
7. Recording rows open Twenty externally; only a tooltip discloses the destination.
8. Pause and Finish recording have identical emphasis while disabled New
   recording remains prominent. Revisit the recording-mode action hierarchy.
9. Search lacks a clear action and result-count feedback; it matches only titles.
10. Show more attaches aria-expanded to a wrapper instead of its button.
11. Idle shared Buttons expose trailing ellipses in the accessibility tree.
    Inspect Twenty UI ButtonText's loading ellipsis semantics centrally.
12. Toggle accessible names repeat labels and include the entire row description.
    Give switches precise labels and separately associated descriptions.

## Visual refinement

13. Heading sizes and page spacing still use scattered literals. Consolidate
    page, section, setup, body, and metadata roles.
14. Some meeting metadata remains 11 px; check native minimum-size readability.
15. Icons outside shared controls still use per-call-site sizes and strokes.
17. Tall narrow previews leave excessive logo-to-card space and truncate months.
    This was observed below the native minimum width, not at that minimum.
18. Skip auto-join disappears below 880 px without an alternate action, including
    part of the supported native window range.
19. The recording indicator uses base blue, which is subdued on dark surfaces.
    Check contrast and choose an existing semantic accent token.

## Unverified areas

- Full keyboard/screen-reader walkthrough, zoom/reflow, measured contrast.
- Traffic-light alignment without the macOS sharing indicator covering it.
- Real permission dialogs, meeting countdown, and provider recording behavior.
  Verification did not start audio capture or change system permissions.

Controls now use Twenty UI directly. Native popover positioning, clickable content
rows, desktop layout, and onboarding decoration remain local compositions;
their styles do not replace shared Button variants.
