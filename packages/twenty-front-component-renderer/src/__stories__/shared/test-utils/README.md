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
│   │   ├── input/                       # one bundle per scenario
│   │   │   ├── input-text-value.front-component.tsx
│   │   │   ├── input-text-focus-blur.front-component.tsx
│   │   │   ├── input-text-properties.front-component.tsx
│   │   │   ├── input-number-properties.front-component.tsx
│   │   │   ├── input-caret.front-component.tsx
│   │   │   ├── input-checkbox.front-component.tsx
│   │   │   ├── input-file-single.front-component.tsx
│   │   │   ├── input-file-multiple.front-component.tsx
│   │   │   ├── input-keyboard.front-component.tsx
│   │   │   ├── input-events.stories.tsx
│   │   │   ├── input-caret.stories.tsx
│   │   │   ├── input-checkbox.stories.tsx
│   │   │   ├── input-file.stories.tsx
│   │   │   ├── input-keyboard.stories.tsx
│   │   │   └── input-properties.stories.tsx
│   │   ├── textarea/                    # textarea-value, textarea-caret, textarea-properties
│   │   ├── select/                      # select-value, select-properties
│   │   ├── button/                      # button-click, button-properties
│   │   ├── form/                        # form-submit, form-properties
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
├── host-api/                            # one bundle per twenty-sdk host API call
│   ├── host-api-navigate.front-component.tsx
│   ├── host-api-snackbar.front-component.tsx
│   ├── host-api-progress.front-component.tsx
│   ├── host-api-side-panel-open.front-component.tsx
│   ├── host-api-side-panel-close.front-component.tsx
│   ├── host-api-unmount.front-component.tsx
│   └── *.stories.tsx
├── showcase/                            # standalone showcase front components
└── shared/
    ├── front-components/                # event-log, card, fixtures, styles (no dispatchers)
    └── test-utils/                      # this folder
        ├── createFrontComponentStoryMeta.ts
        ├── createHtmlElementStory.ts
        ├── createPropertyReflectionStory.ts
        ├── matchers/
        ├── runFrontComponentStory.ts
        └── timeouts.ts
```

Each scenario lives in its own `<tag>-<scenario>.front-component.tsx` bundle.
No bundle reads the execution context to pick a sub-scenario; the bundle URL
alone identifies what is rendered. There is no shared dispatcher under
`shared/front-components/`; per-tag JSX is inlined directly in each bundle.

## How a story is wired up

1. A front component (e.g. `input-text-value.front-component.tsx`) renders one
   fixed scenario inside `<FrontComponentCard title="…">`.
2. `runFrontComponentStory({ frontComponentBundleName, play })` returns a
   Storybook story that:
   - sets the bundled front component as `componentUrl`
   - sets `executionContext.frontComponentId` to the bundle name (so production
     hooks still see a non-empty identity)
   - mounts the page and runs the provided `play` function.
3. The `play` function uses matchers from `test-utils/matchers/*` to wait for
   the component to mount and assert the expected events / state.

## Absolute imports

Every file under `src/__stories__/` uses the existing `@/*` alias mapped to
`./src/*` (configured in `tsconfig.json`):

```ts
import { FrontComponentRenderer } from '@/host/components/FrontComponentRenderer';
import { runFrontComponentStory } from '@/__stories__/shared/test-utils/runFrontComponentStory';
```

No relative `./` or `../` imports inside `src/__stories__/`.

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

1. Create one `<tag>-<scenario>.front-component.tsx` per scenario under
   `html-tag/<category>/<tag>/`. Each bundle imports shared helpers via
   `@/__stories__/shared/front-components/...` and renders its scenario inline.
2. Add `<tag>-events.stories.tsx` using `createHtmlTagClickStory` /
   `createHtmlTagFocusStory` and (if applicable) `<tag>-properties.stories.tsx`
   using `createPropertyReflectionStory`. The `frontComponentBundleName` is the
   bundle basename (e.g. `'span-click'`, `'span-focus-blur'`, `'span-properties'`).

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
name. Basenames must be unique across the whole tree.
