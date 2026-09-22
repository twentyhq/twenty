# Browser API inventory (stage 1)

Run from the repository root:

```sh
npx playwright install chromium
npx nx run twenty-front-component-renderer:compatibility:audit
```

The target builds Storybook and its dependencies, then starts a temporary localhost server and launches the Chromium executable belonging to the installed, lockfile-pinned Playwright package. It never uses a system browser or cached audit verdict. With an existing Storybook build, run `node --import tsx scripts/compatibility/runInventoryAudit.ts` from this package to repeat collection without rebuilding.

Results are written to the ignored `compatibility-results` directory:

- `inventory.json`: validated reference catalog, observations, React and Preact results, and structural findings.
- `summary.md`: counts, selected differences, and coverage limits.
- `status.json`: explicit completion status for the latest attempt.
- `partial.json`: available evidence and an error when collection fails.

Each attempt removes previous reports before starting. Exit code 0 means collection is complete, not that the renderer is browser-compatible. There is no baseline, policy classification, behavior verdict, HTML report, or CI gate in this increment.

## What is measured

A clean reference document supplies all feature identifiers. The native collector is compiled without SDK plugins and evaluated in a lexical scope without installing a diagnostic global. It discovers `globalThis` and `window` independently, their exposed functions and namespaces, function statics, and exposed prototypes. Descriptor inspection follows inheritance and includes non-enumerable members. Well-known and registered symbols keep stable identities; local symbols are disclosed as unmatchable.

Explicit safe factories inspect selected document, navigator, location, history, storage, event, URL, request/response, HTML, and SVG objects. The HTML/SVG selection is maintained independently of renderer allowed-element lists. These are inert constructors or detached elements, with no device access or permission requests. Constructor and prototype availability is measured independently of factory results.

The React and Preact fixtures use the existing SDK build plugins and production `FrontComponentRenderer` iframe/worker bootstrap. Rendered `div` and `svg` targets are the references delivered to components by the SDK. Direct DOM factories remain separate targets. A host-forwarded button event requests collection only after SDK context, seeded storage snapshots, viewport geometry, and the rendered element's nonzero geometry are observable. Polling is bounded by an external Node/Playwright timeout supervisor. Observations return as serialized rendered text, without production diagnostics.

Every requested member has an observation: missing, callable, value, accessor, or uninspectable. Comparison distinguishes shape differences from descriptor flags and inheritance depth. A callable with incorrect behavior remains present with behavior unverified. Uninspectable reference descriptors cannot establish a structural expectation. Chromium's virtual CSS style names can enumerate without providing a descriptor; those entries remain explicitly uninspectable.

Zod validates the catalog, observations, environment, and final report. Completion checks require unique identifiers, both runtimes, every requested target and member, and findings consistent with the observations. Empty, malformed, duplicate, missing, crashed, and timed-out collections fail. Individual unavailable sandbox factories remain visible as missing or uninspectable targets; failed native factories or incomplete enumeration invalidate the reference.

## Limits and reproducibility

The inventory does not recursively traverse every object graph or invoke arbitrary getters or constructors. Each report lists unexpanded accessor/object values, interfaces without automatic instance construction, unavailable factories, and unstable symbols. Cyclic references are not expanded; prototype cycles fail collection. Sandbox-only additions are outside the reference comparison.

All present APIs have **unverified behavior**. Presence does not establish event delivery, geometry correctness, storage semantics, device support, visual CSS compatibility, or browser conformance. Intentionally restricted APIs remain visible without assigning policy in this stage.

Reports record Playwright/Chromium versions and revision, executable, platform/architecture, OS release, Node version, Git revision and dirty state, lockfile hash, viewport, locale, timezone, launch options, origin, and reference user agent/security context. Each runtime uses a fresh context with the same options. Service workers use Playwright's default `allow` setting: its `block` option injects a navigator getter into the production sandbox and raises a security error. The clean reference and fixtures register no service workers. Local reports are environment-specific and never update a baseline.

## Initial local verification

Two complete runs on macOS arm64, Playwright 1.60.0 / Chromium 148.0.7778.96, produced identical reference catalogs, reference observations, both sandbox collections including coverage, and findings. Sandbox-only generated property names are excluded from per-member coverage notes. Each runtime collected 4,117 targets and 225,293 member observations. Counts include inherited members on each target and separate global surfaces; they are not counts of distinct browser APIs.

Both React and Preact reported 204,449 missing members, 694 shape differences, 19,876 present members with unverified behavior, and 274 uninspectable comparisons. Examples include missing `globalThis.Element.prototype.closest` and `instance:rendered.div.closest`, with `window.fetch` and `window.requestAnimationFrame` present but unverified. Clipboard reading remains visible as missing.

Validation included 11 focused unit tests; direct package typechecking, lint, and formatting; SDK fixture builds; Storybook and production builds; and an uncached `twenty-shared` build. The production JavaScript and declarations contained no audit code. Truncating real results, substituting runtime labels, returning malformed data, and dropping findings all failed validation. Controlled Chromium fixtures confirmed timeout and malformed-output rejection, and a deliberately polluting collector failed the reference guard.

The existing shared barrel generator stalled in this environment. Verification used the committed generated sources, built dependencies explicitly, then ran `compatibility:audit --excludeTaskDependencies`. The full dependency chain remains dependent on that existing generator; it was not changed by this audit work.
