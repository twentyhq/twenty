# Front-component Storybook test utilities

This folder contains the shared plumbing used by the Storybook stories under
`src/__stories__/html-tag` and `src/__stories__/host-api`. The stories exercise
how front components (rendered inside a sandboxed worker via `remote-dom`)
forward events and properties to the host page.

## Folder layout

```
__stories__/
├── html-tag/                            # one folder per HTML tag, grouped by category
│   ├── form/
│   │   ├── input/                       # <input>: events, caret, file, properties, …
│   │   │   ├── input.front-component.tsx
│   │   │   ├── input-events.stories.tsx
│   │   │   ├── input-caret.stories.tsx
│   │   │   ├── input-checkbox.stories.tsx
│   │   │   ├── input-file.stories.tsx
│   │   │   ├── input-keyboard.stories.tsx
│   │   │   └── input-properties.stories.tsx
│   │   ├── textarea/                    # <textarea>: events, caret, properties
│   │   ├── select/                      # <select>: events, properties
│   │   ├── button/                      # <button>: events, properties
│   │   ├── form/                        # <form>: events (submit), properties
│   │   ├── fieldset/, legend/, label/, output/, progress/, meter/, option/, …
│   ├── sectioning/                      # header, footer, nav, section, h1-h6, …
│   ├── text/                            # p, blockquote, pre, hr
│   ├── text-inline/                     # span, strong, em, code, b, i, …
│   ├── list/                            # ul, ol, li, dl, dt, dd, menu
│   ├── grouping/                        # div, figure, figcaption, ruby, rt, rp
│   ├── interactive/                     # a, details, summary, dialog
│   ├── table/                           # table, thead, tbody, tfoot, tr, th, td, …
│   ├── embedded/                        # img, picture, iframe
│   └── svg/                             # svg, g, circle, ellipse, rect, line, …
├── host-api/                            # twenty-sdk host API calls (navigate, snackbar, …)
│   ├── host-api.front-component.tsx
│   └── *.stories.tsx
├── showcase/                            # standalone showcase front components
└── shared/
    ├── front-components/                # event-log, card, element-coverage, property-reflection, fixtures
    └── test-utils/                      # this folder
        ├── createFrontComponentStoryMeta.ts
        ├── createHtmlElementStory.ts
        ├── createPropertyReflectionStory.ts
        ├── matchers/
        ├── runFrontComponentStory.ts
        └── timeouts.ts
```

Each tag owns its own folder with `<tag>.front-component.tsx` (the sandboxed
worker bundle) alongside one stories file per concern (`<tag>-events`,
`<tag>-properties`, `<tag>-caret`, …). Cross-tag rendering helpers live in
`shared/front-components/` (`ElementCoverageScenario`,
`PropertyReflectionScenario`) and are imported by the per-tag bundles.

## How a story is wired up

1. A front component (e.g. `input.front-component.tsx`) declares scenarios
   keyed by string id. The `frontComponentId` from the execution context picks
   which scenario to render.
2. `runFrontComponentStory({ frontComponentBundleName, scenarioId, play })`
   returns a Storybook story that:
   - sets the bundled front component as `componentUrl`
   - sets `executionContext.frontComponentId` to `scenarioId`
   - mounts the page and runs the provided `play` function.
3. The `play` function uses matchers from `test-utils/matchers/*` to wait for
   the component to mount and assert the expected events / state.

## Shared matchers

- `expectFrontComponentMounted(canvas)` — waits for the
  `data-testid="front-component-mounted"` marker emitted by `FrontComponentCard`.
- `expectEventLogged({ canvas, matcher })` — waits for an entry produced by
  `useEventLog` whose shape matches the provided predicate.
- `expectFrontComponentValue({ canvas, expected })` — waits for the
  `data-testid="front-component-value"` element rendered by the fixture to
  display the expected string.
- `expectAttributesReflected({ canvas, attributes })` /
  `expectPropertiesReflected({ canvas, properties })` — used by
  property-reflection stories to assert host DOM mirror values.

## Adding a new tag

1. Add an entry to `scripts/front-component-stories/generate-per-tag-coverage.ts`
   (or create the files by hand under `html-tag/<category>/<tag>/`).
2. The per-tag `<tag>.front-component.tsx` typically delegates to
   `<ElementCoverageScenario tag="..." eventName="..." />` and
   `<PropertyReflectionScenario variant="..." />`. Rich tags inline their own
   scenarios (e.g. `input.front-component.tsx` has caret/file/keyboard).
3. Write `<tag>-events.stories.tsx` using `createHtmlTagClickStory` /
   `createHtmlTagFocusStory` and (if applicable) `<tag>-properties.stories.tsx`
   using `createPropertyReflectionStory`. The `frontComponentBundleName` always
   matches the tag name.

## Running the tests

```bash
# Run a single story file
npx vitest run --config vitest.storybook.config.ts <pattern>

# Run all HTML stories
npx vitest run --config vitest.storybook.config.ts html-tag
```

The bundles consumed by the renderer are produced by the
`build-source-examples` script. It discovers any `*.front-component.tsx` file
under `html-tag/`, `host-api/` and `showcase/` (skipping `shared/` directories)
and emits one `.mjs` bundle per file, using the file basename as the bundle
name.
