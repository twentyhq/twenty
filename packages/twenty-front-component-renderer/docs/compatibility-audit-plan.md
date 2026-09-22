# Renderer compatibility audit plan

Build a development and CI audit that compares the front component renderer with a normal page in the same pinned Chromium build. Use Zod to validate observations and behavior expectations, identify missing or incomplete APIs, and prevent compatibility regressions. Produce a filterable HTML report, machine-readable JSON, and a short CI summary.

**Agreed decisions**

- Audit a broad browser API inventory, including features unused by current components.
- Use a real Chromium page as the reference rather than web specifications.
- Combine automated API inventory with focused behavior probes.
- Block regressions against a reviewed, committed baseline of current results.
- Publish HTML and JSON artifacts and support the same audit locally.

**1. Establish the reference and execution harness**

Use the Chromium binary associated with the locked Playwright dependency. Record the Playwright version, Chromium version, platform, launch configuration, viewport, and audit schema version in every report. Reference and sandbox measurements must use the same browser configuration. CI uses its fixed Linux environment; local runs disclose environment differences and do not silently overwrite the CI baseline.

Run a clean reference page without Storybook or application scripts. Run renderer fixtures through `FrontComponentRenderer`, the production sandbox bootstrap, and the SDK build plugins. Reuse the existing Storybook build and fixture infrastructure to expose the renderer fixtures to a Playwright-driven audit command. Compile native reference fixtures without the SDK's remote DOM transformations.

Start measurements after the component mounts and host communication, render context, storage snapshots, and geometry initialization are ready. Layout probes wait for observable host and worker geometry conditions rather than fixed sleeps. Inspect `globalThis` and the polyfilled `window` separately because they are distinct objects in the renderer.

Exercise SDK interaction probes with React and Preact. Keep results keyed by runtime so one runtime cannot conceal a failure in the other. Record framework-independent observations separately where their environment is demonstrably shared.

Use a minimal fixture to return serialized observations through the existing rendering path. Treat missing fixture output as a harness failure. Keep audit collectors, fixtures, and report code out of production entry points; do not introduce a production diagnostic API.

**2. Collect a broad, repeatable API inventory**

Discover reference globals, exposed interface objects, constructor statics, prototype members, and members on browser objects such as `document`, `navigator`, and `location`. Include non-enumerable and inherited members. Preserve stable names for symbol members where possible and disclose members that cannot be identified consistently.

Inspect property descriptors without invoking arbitrary getters or constructors. Use explicit safe instance factories for DOM nodes, HTML/SVG elements, events, and other objects requiring instances. Record constructor availability and instance member availability separately. For rendered elements, inspect the references components actually receive through the SDK as well as direct DOM creation where relevant.

Build expectations from the reference observations, never from the renderer's existing polyfill list or allowed-tag list. Query those same feature identifiers inside the renderer. Group an absent interface with its affected members to make large gaps readable.

Use stable identifiers such as `window.requestAnimationFrame`, `globalThis.URL`, and `Element.prototype.closest`, augmented with surface or fixture identity when needed. Record whether each member is absent, a callable value, another value, or an accessor. Differences in property placement and descriptor shape remain separate from member availability; a worker implementation need not use native browser inheritance internally to provide the same operation.

Do not compare volatile values, function source text, native-code markers, or function arity as evidence of compatibility. Prevent cycles and record collection failures explicitly. List uninspected objects and missing factories so the report never implies exhaustive coverage of every browser capability.

This first version measures observable JavaScript APIs and selected DOM behavior. It does not establish complete browser conformance, visual CSS compatibility, or support for features Chromium does not expose in the configured environment.

**3. Define Zod contracts and focused behavior probes**

Use separate Zod schemas for inventory observations, probe results, policy annotations, baseline metadata, and the final report. Validate serialized data at collection boundaries and before comparing or publishing it. Validate complete and unique feature/probe identifiers as well as individual result shapes; a valid empty report must not pass.

Generate structural expectations from normalized reference observations. Each behavior probe owns an explicit schema for its expected outcome, using refinements where necessary. Parse plain observation data rather than passing live, cyclic browser objects to Zod. Keep property inspection, browser actions, and result comparison in focused utilities.

Run equivalent scenarios in the reference page and renderer. Assert meaningful behavior, rather than byte-for-byte equality of environment-dependent output. Initial probe families are:

| Family | Initial behavior checks |
| --- | --- |
| DOM traversal | `contains` for self, ancestors, descendants, and unrelated nodes; `closest`; `compareDocumentPosition` relationships |
| Events | Event construction, bubbling, `composedPath`, and pointer data; SDK-forwarded handler observations for React and Preact |
| Styles | Inline style reads, class-based computed styles, and stylesheet insertion/removal |
| Geometry | Nonzero bounds, updates after resize, viewport values, and observable scrolling after writes |
| Mutation observers | Delivery of mutations, requested old values, disconnect, and callback scheduling |
| Storage and aliases | Storage read/write/remove behavior, global/window alias availability, and animation callback cancellation |

Use deterministic DOM fixtures and bounded waits. Isolate probes that could hang or alter shared state in disposable renderer instances. Keep the timeout supervisor outside the worker, so a synchronous worker hang cannot prevent cleanup. Native reference failures, crashes, and timeouts invalidate the comparison and fail the audit rather than becoming expected renderer gaps.

Inventory clipboard, media, permission-dependent, and hardware-dependent interfaces. Add behavior probes only where deterministic fixtures are available. A mocked host bridge may establish bridge behavior, but must not be presented as proof of native device or permission compatibility.

**4. Separate observations, policy, and regression status**

Keep three independent dimensions in the report:

| Dimension | Values or meaning |
| --- | --- |
| Observation | Missing, shape mismatch, present with behavior unverified, tested behavior passed, tested behavior failed, or uninspectable |
| Policy | Ordinary compatibility target, documented intentional restriction, or awaiting classification |
| Change | Existing result, regression, improvement, new reference feature, or changed audit coverage |

A passing probe establishes only its tested behavior. API-level summaries with limited or mixed probe coverage must preserve those details.

Keep intentional restrictions visible with a reason and source reference. For example, clipboard reading is explicitly outside the current clipboard bridge's granted capabilities. Absence alone does not prove intent. Do not add broad exclusions that hide whole API families, and do not automatically exempt a previously passing behavior merely because it has a policy annotation.

Commit the initial reference catalog and renderer baseline after reviewing the first complete run. Store the baseline separately from generated reports. Provide an explicit command that writes a candidate update and a readable diff for review. Audit execution must never accept its own failures by updating the baseline automatically.

CI fails for disappearing API members, compatibility-breaking member changes, previously passing probes that fail, removed required coverage, malformed/incomplete results, crashes, and timeouts. Existing observed gaps remain visible without failing CI. Improvements are reported and should be promoted into the baseline with the change that fixes them. Obsolete baseline entries must be visible in the update diff.

Browser upgrades and intentional inventory/probe changes require a reviewed reference or coverage update. Report their changes separately from renderer regressions. A missing reference API or a deleted probe must not silently remove an existing compatibility obligation.

**5. Build the report and integrate CI**

Generate a standalone HTML report with search and filters for API family, runtime, observation, policy, and change status. Show reference and renderer evidence, probe names, intentional-restriction reasons, and untested coverage. Group missing interfaces with their members and prioritize regressions and failed behaviors. Escape collected strings when rendering HTML.

Show inventory coverage and behavior coverage separately. Avoid a single overall compatibility percentage that treats presence as working behavior.

Also emit versioned JSON and a concise Markdown summary listing regressions, improvements, existing gaps, and run completeness. Reports should be available on failed runs, including partial evidence when collection fails.

Add proposed Nx targets `compatibility:audit` and `compatibility:baseline:candidate` in `project.json`. The audit target builds its dependencies and fixtures, starts the local harness, runs collection/probes, validates results, compares the baseline, and writes reports. The baseline target only produces a reviewable candidate from a complete run.

Integrate the audit into `.github/workflows/ci-front-component-renderer.yaml`, reusing the existing Storybook build and Chromium setup. Upload reports with an always-run artifact step and include the audit job in the workflow's final status check. Include audit code, fixtures, baseline, build inputs, and workflow changes in affected-file detection. Run browser measurements freshly in CI; cache dependencies and builds rather than accepting a stale audit verdict.

Extend the fixture scan roots in `scripts/front-component-stories/build-source-examples.ts` and the corresponding Nx inputs to include compatibility fixtures. Keep each new source file focused with one public export, following the surrounding naming conventions.

**6. Deliver and verify in three increments**

1. Build the harness, Zod contracts, and broad inventory. Demonstrate real reference-versus-sandbox differences and explicit collection coverage.
2. Add the initial behavior probes, reviewed policies, regression comparison, and baseline candidate workflow. Capture existing limitations without fixing the polyfills as part of the audit implementation.
3. Add the filterable HTML/JSON reports and CI integration, then enable the regression gate with the reviewed baseline.

Before completion, verify that a controlled missing API and a callable but incorrect implementation produce different findings; an intentionally restricted feature stays visible; React and Preact failures remain distinguishable; and removing a required result, timing out, or returning malformed data fails the audit. Verify the gate with a controlled regression and verify improvements appear in the candidate baseline diff.

Run repeated complete browser audits to establish stability before enabling the gate. Run focused unit tests for comparison/classification and report completeness, relevant browser fixtures, package lint, and direct package typechecking. Rebuild `twenty-shared` without cache before trusting dependent checks if its branch state changed. Confirm the production build does not pull in audit modules.

**Code anchors**

- Worker installation: `src/remote/worker/remote-worker.ts`
- Render readiness and context: `src/remote/worker/rendering/utils/renderFrontComponent.ts`
- Global/window installation targets: `src/polyfills/utils/resolveGlobalScopeInstallTargets.ts`
- Existing browser test configuration: `vitest.storybook.config.ts`
- Fixture build paths: `scripts/front-component-stories/build-source-examples.ts`
- Known component gaps: `src/__stories__/twenty-ui-gallery/README.md`
- Build and cache inputs: `project.json`
- CI workflow: `.github/workflows/ci-front-component-renderer.yaml` at the repository root

Package-relative paths above refer to `packages/twenty-front-component-renderer` unless stated otherwise. Existing gap documentation is a starting point; the audit must measure current behavior rather than assuming the documentation is current.

**External references**

- [Zod basic usage](https://zod.dev/basics) for parsing unknown data and collecting validation issues.
- [Playwright browser management](https://playwright.dev/docs/browsers) for the relationship between Playwright releases and browser binaries.
