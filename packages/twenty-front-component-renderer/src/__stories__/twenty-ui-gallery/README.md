# Twenty UI renderer coverage

`TwentyUiGallery.stories.tsx` contains the component catalogs and focused
component stories. Each fixture has React and Preact stories built with
`createGalleryStory`, with an explicit bundle name, runtime, and play function.
Scenarios share their checks between runtimes where behavior matches. The story
file contains the metadata and named entries; `utils/` holds the story factory,
shared assertions, render checks, interaction checks, and known-failure scenarios.
Shared types and error patterns live in `types/` and `constants/`.
`createGalleryRenderTest` checks the
exact set of expected failed components. `createSandboxFailureTest` mounts the
fixture, clicks a trigger and asserts the sandbox errors; its error expectation
requires at least one error and can allow additional known errors without
requiring them to occur.

| Fixture | Components |
| --- | --- |
| `twenty-ui-field-controls` | Field, Input, InputGroup, Textarea |
| `twenty-ui-display-helpers` | Text |
| `twenty-ui-list-item` | ListItem |
| `twenty-ui-tabs` | Tabs |
| `twenty-ui-popover` | Popover |
| `twenty-ui-menu` | Menu |
| `twenty-ui-select` | Select |
| `twenty-ui-toast` | Toast |
| `twenty-ui-alert-dialog` | AlertDialog |
| `twenty-ui-switch` | Switch (interaction coverage in addition to the original input gallery) |
| `twenty-ui-tooltip` | Tooltip (convenience and compound APIs) |

The focused fixtures import public twenty-ui entry points and use
`TwentyUiGalleryCard` for the light theme, mount marker, and `twenty-ui/style.css`.
The story builder resolves that stylesheet to the individual build's CSS so
class names match the JavaScript used by the sandbox. Importing CSS through the
shared card also exercises the SDK's CSS injection and the renderer's style bridge.

## Known sandbox limitations

These are compatibility regression stories, not assertions that the components
work fully in the sandbox. Scenarios that raise errors require specific errors and
reject unrelated ones, following the existing gallery convention. Known
precursor errors are optional because the host can coalesce worker errors into
a single state update. A fix must change the corresponding story to assert
successful behavior; do not keep or broaden an obsolete error expectation.
No stories are skipped or marked as expected-to-fail by the runner.

| Component | Current limitation |
| --- | --- |
| Field controls | Forwarded events lack the `nativeEvent` Base UI reads for `composedPath`. Textarea's cloned render element loses its change handler in React. The value report checks the state received by the component after typing. |
| Tabs | Activation fails on the missing `nativeEvent` for `composedPath` in both runtimes. |
| Popover, Dialog, AlertDialog | Opening fails while reading pointer contact data from the missing `nativeEvent`. |
| Menu, Select | Opening fails on the missing `nativeEvent.pointerType` and pointer contact data. |
| Switch, Checkbox, Radio, CardPicker | Activation attempts to construct an unavailable `PointerEvent`. `CardPickerReact` never gets that far: React drops the click handler Base UI adds through `React.cloneElement`, so only the group's focus handling fails on the missing `nativeEvent` for `composedPath`. |
| Slider | Thumbs stay hidden because the sandbox has no `ResizeObserver` to re-measure after the first geometry batch. |
| Tooltip | `TooltipReact` opens on hover but remains open after Escape because React drops the handlers Base UI adds through `React.cloneElement`. |

The worker DOM now provides `Node.contains`, `compareDocumentPosition`,
`getRootNode`, `Element.matches`, `closest`, `querySelector` backed by a port of
`css-what` and `css-select`, and property accessors for boolean ARIA attributes
so React and Preact forward `true`/`false` instead of empty strings and remove
the attribute when the prop is cleared. `getAttribute` and the selector engine
read the remote properties React and Preact set. The selector engine handles
custom element tags, live control properties, and relative selectors.
`TooltipPreact` therefore covers hover opening and Escape dismissal. Pointer
leave still needs document-level `mousemove` delivery for the safe polygon, and
the compound tooltip's title and description are not covered yet.

Once the remaining gaps are fixed, extend the stories to verify selection,
disabled items, keyboard navigation, and overlay content, dismissal, and focus
restoration. The fixtures already include the controlled state, compound parts,
and callback output for those checks. Passing display, ListItem, and Toast
stories verify rendering/CSS or interaction behavior directly.

## Run

From the repository root, build the fixture dependencies and sandbox with
`npx nx run twenty-front-component-renderer:storybook:prebuild`.
Then, from `packages/twenty-front-component-renderer`, run:

```sh
npx vitest run --config vitest.storybook.config.ts TwentyUiGallery.stories.tsx
```
