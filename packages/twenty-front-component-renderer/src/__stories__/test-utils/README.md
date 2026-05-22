# Front-component Storybook test utilities

This folder contains the shared plumbing used by the Storybook stories in
`src/__stories__/event-forwarding`. The stories exercise how front components
(rendered inside a sandboxed worker via `remote-dom`) forward events and
properties to the host page.

## Folder layout

```
__stories__/
├── event-forwarding/
│   ├── baseline/                 # one click/focus story per HTML element
│   ├── caret/                    # caret-preserving inputs/textareas
│   ├── form/                     # form controls (input, select, textarea, …)
│   ├── host-api/                 # twenty-sdk host API calls
│   ├── pointer-keyboard/         # click, double-click, hover, keyboard
│   └── property-reflection/      # attributes & properties cross the bridge
├── example-sources/
│   ├── *.probe.front-component.tsx   # data-driven probes (scenarios)
│   ├── shared/                       # event-log, probe-card, fixtures
│   └── *.front-component.tsx         # standalone showcase examples
└── test-utils/
    ├── createBaselineStory.ts        # builds baseline click/focus stories
    ├── createProbeMeta.ts            # shared meta args + mock setup
    ├── createPropertyReflectionStory.ts
    ├── matchers/                     # shared waitFor-based assertions
    ├── probe-timeouts.ts             # interaction/probe-ready timeouts
    └── runProbeStory.ts              # helper to wire scenario into Renderer
```

## How a probe story works

1. A probe component (e.g. `form-controls.probe.front-component.tsx`) declares a
   map of scenarios keyed by string id. The `frontComponentId` from the
   execution context is used to pick which scenario to render.
2. `runProbeStory({ probe, scenarioId, play })` returns a Storybook story that:
   - sets the bundled probe component as `componentUrl`
   - sets `executionContext.frontComponentId` to `scenarioId`
   - mounts the page and runs the provided `play` function.
3. The `play` function uses matchers from `test-utils/matchers/*` to wait for
   probe readiness and assert the expected events/state.

## Shared matchers

- `expectProbeReady(canvas)` — waits for the `data-probe-ready` marker emitted
  by `ProbeCard`.
- `expectEventLogged({ canvas, matcher })` — waits for an entry produced by
  `useEventLog` whose shape matches the provided predicate.
- `expectSubjectState({ canvas, predicate })` — waits for the state JSON
  rendered by the probe to satisfy the predicate.
- `expectAttributesReflected({ canvas, attributes })` /
  `expectPropertiesReflected({ canvas, properties })` — used by
  property-reflection stories to assert host DOM mirror values.

## Adding a new scenario

1. Pick the right probe in `example-sources/*.probe.front-component.tsx` (or
   create a new one and register the bundle in
   `scripts/front-component-stories/build-source-examples.ts` is **not**
   required — discovery is glob-based).
2. Add a scenario to the probe's `SCENARIOS` map under a new id
   (e.g. `keyboard:my-new-case`).
3. Create a story file under `event-forwarding/<category>/<name>.stories.tsx`.
   Use the literal `meta` object pattern (Storybook CSF requires it), referencing
   `PROBE_DEFAULT_ARGS` and `probeBeforeEach` from
   `test-utils/createProbeMeta.ts`.
4. Use `runProbeStory(...)` (or `createBaselineClickStory`,
   `createBaselineFocusStory`, `createPropertyReflectionStory`) to wire the
   scenario into a Storybook story.

## Running the tests

```bash
# Run a single story file
npx vitest run --config vitest.storybook.config.ts <pattern>

# Run all front-component event-forwarding tests
npx vitest run --config vitest.storybook.config.ts event-forwarding
```

The bundles consumed by the renderer are produced by the
`build-source-examples` script. It discovers any `*.front-component.tsx` and
`*.probe.front-component.tsx` file (except files under `shared/`).
