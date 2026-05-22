# Front-component Storybook test utilities

This folder contains the shared plumbing used by the Storybook stories under
`src/__stories__/html` and `src/__stories__/host-api`. The stories exercise how
front components (rendered inside a sandboxed worker via `remote-dom`) forward
events and properties to the host page.

## Folder layout

```
__stories__/
├── html/                                # one folder per HTML element / category
│   ├── form/
│   │   ├── input/                       # <input>: events, caret, properties, …
│   │   │   ├── input.front-component.tsx
│   │   │   ├── input.stories.tsx
│   │   │   ├── input-caret.stories.tsx
│   │   │   ├── input-checkbox.stories.tsx
│   │   │   ├── input-file.stories.tsx
│   │   │   └── input-keyboard.stories.tsx
│   │   ├── textarea/                    # <textarea>: events, caret
│   │   ├── select/                      # <select>: events
│   │   ├── button/                      # <button>: events
│   │   └── form/                        # <form>: submit
│   ├── div/                             # <div>: click, double-click, hover, …
│   ├── element-coverage/                # baseline click/focus on every HTML element
│   │   ├── element-coverage.front-component.tsx
│   │   ├── click-*.stories.tsx
│   │   └── focus-blur.stories.tsx
│   └── property-reflection/             # attributes & properties cross the bridge
├── host-api/                            # twenty-sdk host API calls (navigate, …)
│   ├── host-api.front-component.tsx
│   └── *.stories.tsx
├── showcase/                            # standalone showcase front components
└── shared/
    ├── front-components/                # event-log, card, fixtures, styles
    └── test-utils/                      # this folder
        ├── createFrontComponentStoryMeta.ts
        ├── createHtmlElementStory.ts
        ├── createPropertyReflectionStory.ts
        ├── matchers/
        ├── runFrontComponentStory.ts
        └── timeouts.ts
```

Each element folder ships its own `*.front-component.tsx` fixture (the sandboxed
worker bundle) alongside one stories file per concern (events, caret,
properties, …).

## How a story is wired up

1. A front component (e.g. `input.front-component.tsx`) declares a map of
   scenarios keyed by string id. The `frontComponentId` from the execution
   context picks which scenario to render.
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

## Adding a new scenario

1. Pick the matching front component under `html/...` / `host-api/...` (or
   create a new one — the bundler picks up `*.front-component.tsx` files
   automatically; basenames must be unique).
2. Add a scenario to the fixture's `SCENARIOS` map under a new id
   (e.g. `input:text:new-case`).
3. Create a story file in the same element folder. Reuse
   `FRONT_COMPONENT_STORY_DEFAULT_ARGS` and `resetFrontComponentStoryMocks` from
   `shared/test-utils/createFrontComponentStoryMeta.ts`.
4. Use `runFrontComponentStory(...)` (or `createHtmlElementClickStory`,
   `createHtmlElementFocusStory`, `createPropertyReflectionStory`) to wire the
   scenario into a Storybook story.

## Running the tests

```bash
# Run a single story file
npx vitest run --config vitest.storybook.config.ts <pattern>

# Run all HTML stories
npx vitest run --config vitest.storybook.config.ts html
```

The bundles consumed by the renderer are produced by the
`build-source-examples` script. It discovers any `*.front-component.tsx` file
under `html/`, `host-api/` and `showcase/` (skipping `shared/` directories) and
emits one `.mjs` bundle per file, using the file basename as the bundle name.
