# Browser API inventory (stage 1)

Run from the repository root:

```sh
npx playwright install chromium
npx nx run twenty-front-component-renderer:compatibility:audit
```

The target builds Storybook and its dependencies, then starts a temporary localhost server and launches the Chromium executable belonging to the installed, lockfile-pinned Playwright package. It never uses a system browser or cached audit verdict. With an existing Storybook build, run `node --import tsx scripts/compatibility/runInventoryAudit.ts` from this package to repeat collection without rebuilding. The run first checks that the build contains both inventory stories and fixtures, and a fixture built from older sources fails when it lacks a reference factory.

Results are written to the ignored `compatibility-results` directory:

- `inventory.json`: validated reference catalog, observations, React and Preact results, and structural findings.
- `summary.md`: counts, selected differences, and coverage limits.
- `status.json`: explicit completion status for the latest script run, with the collected commit and working tree state.
- `partial.json`: available evidence and an error when collection fails.

Each script run removes previous reports before starting. A failed Nx dependency build never starts the script, so compare the `status.json` commit with the checkout before trusting it. Exit code 0 means collection is complete, not that the renderer is browser-compatible. There is no baseline, policy classification, behavior verdict, HTML report, or CI gate in this increment.

## What is measured

A clean reference document supplies all feature identifiers. The native collector is compiled without SDK plugins or schema libraries and evaluated in a lexical scope without installing a diagnostic global; it returns its result as a JSON string. The names on `globalThis` and `window` are separate targets. Exposed functions and namespaces, function statics, and exposed prototypes are expanded through `globalThis`, and again through `window` only when it is a different object. In the sandbox, where `window` is a separate polyfill object, window values that differ from their `globalThis` counterparts are listed as skipped. Descriptor inspection follows inheritance and includes non-enumerable members. Well-known and registered symbols keep stable identities; local symbols are disclosed as unmatchable.

Explicit safe factories inspect selected document, navigator, location, history, storage, event, URL, request/response, HTML, and SVG objects. The HTML/SVG selection is maintained independently of renderer allowed-element lists. These are inert constructors or detached elements, with no device access or permission requests. Factories read globals through `globalThis` and only call constructors that exist, so an API the sandbox lacks is missing rather than uninspectable. Constructor and prototype availability is measured independently of factory results.

The React and Preact fixtures use the existing SDK build plugins and production `FrontComponentRenderer` iframe/worker bootstrap. Rendered `div` and `svg` targets are the references delivered to components by the SDK. Direct DOM factories remain separate targets. A host-forwarded button event requests collection only after SDK context, seeded storage snapshots, viewport geometry, and the rendered element's nonzero geometry are observable. One deadline covers navigation, readiness polling, and output, and an external Node/Playwright supervisor with a longer budget catches anything that outlives it. Loader and renderer errors replace the harness with an error element that the collector reads, so they fail the run with their message. Observations return as serialized text in a hidden element, without production diagnostics.

Every requested member has an observation: missing, callable, value, accessor, or uninspectable. A catalog member without a property descriptor on a sandbox target is read once; members served only through proxy traps, such as the renderer's element `style` object, are uninspectable rather than missing. Comparison distinguishes shape differences from descriptor flags and inheritance depth. A callable with incorrect behavior remains present with behavior unverified. Uninspectable reference descriptors cannot establish a structural expectation. Chromium's virtual CSS style names can enumerate without providing a descriptor; those entries remain explicitly uninspectable.

An unavailable sandbox target produces one finding that records its reason and member count; its members stay listed per target in the collection. Available targets produce one finding per member. Findings that are identical in React and Preact are merged and list every runtime they apply to.

Zod validates the catalog and each collection once, when they reach Node; the report is assembled from that validated data. Completion checks require unique identifiers, both runtimes, every requested target and member, and a fully collected reference. Empty, malformed, duplicate, missing, crashed, and timed-out collections fail. Individual unavailable sandbox factories remain visible as missing or uninspectable targets; failed native factories or incomplete enumeration invalidate the reference, and a sandbox object whose enumeration throws is recorded as an uninspectable target.

## Limits and reproducibility

The inventory does not recursively traverse every object graph or invoke arbitrary getters or constructors; the single read of a sandbox member without a descriptor reaches proxy traps but never an accessor. Each report lists unexpanded accessor/object values, interfaces without automatic instance construction, unavailable factories, and unstable symbols. Cyclic references are not expanded; prototype cycles fail collection. Sandbox-only additions are outside the reference comparison.

All present APIs have **unverified behavior**. Presence does not establish event delivery, geometry correctness, storage semantics, device support, visual CSS compatibility, or browser conformance. Intentionally restricted APIs remain visible without assigning policy in this stage.

Reports record Playwright/Chromium versions and revision, executable, platform/architecture, OS release, Node version, Git revision and dirty state, lockfile hash, viewport, locale, timezone, launch options, origin, and reference user agent/security context. Each runtime uses a fresh context with the same options. Service workers use Playwright's default `allow` setting: its `block` option injects a navigator getter into the production sandbox and raises a security error. The clean reference and fixtures register no service workers. Local reports are environment-specific and never update a baseline.

## Initial local verification

Two complete runs on macOS arm64, Playwright 1.60.0 / Chromium 148.0.7778.96, produced identical reference catalogs, reference observations, both sandbox collections including coverage, and findings. Each run took about five seconds after the Storybook build. Sandbox-only generated property names are excluded from per-member coverage notes. Each runtime collected 2,099 targets and 122,381 member observations. Counts include inherited members on each target; they are not counts of distinct browser APIs.

The report held 36,394 findings, all shared by React and Preact. Each runtime had 1,538 absent targets grouping 87,525 catalog members, 16,039 missing members on available targets, 615 shape differences, 17,490 present members with unverified behavior, and 712 uninspectable members: 703 served by the renderer's `style` proxy and 9 Chromium virtual CSS names. Examples include missing `globalThis.Element.prototype.closest` and `instance:rendered.div.closest`, with `window.fetch` and `window.requestAnimationFrame` present but unverified. Clipboard reading remains visible through the absent `globalThis.Clipboard.prototype` target.

Validation included 66 unit tests across the collectors, schemas, comparison, summary, server, and Storybook build checks; direct package typechecking, lint, and formatting; SDK fixture builds; and a Storybook build. The in-page reference bundle contains no zod or other global-writing dependency. A missing Storybook build, an invalid served catalog, and a fixture without a reference factory each failed within a second with their cause.

Fixtures and Storybook were built directly with `scripts/front-component-stories/build-source-examples.ts` and `storybook build --test` before running the script. The shared barrel generator stalled in an earlier environment, so the full Nx dependency chain was not exercised; it was not changed by this audit work.
