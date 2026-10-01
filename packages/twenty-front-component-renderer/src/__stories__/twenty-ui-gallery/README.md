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
| `twenty-ui-image-input` | ImageInput |
| `twenty-ui-list-item` | ListItem |
| `twenty-ui-tabs` | Tabs |
| `twenty-ui-popover` | Popover |
| `twenty-ui-menu` | Menu |
| `twenty-ui-select` | Select |
| `twenty-ui-toast` | Toast |
| `twenty-ui-alert-dialog` | AlertDialog |
| `twenty-ui-switch` | Switch (interaction coverage in addition to the original input gallery) |
| `twenty-ui-tooltip` | Tooltip (convenience and compound APIs) |
| `twenty-ui-responsive-hooks` | useIsMobile, useIsTouchDevice, Button hotkeys |
| `twenty-ui-reading-directions` | Callout, ButtonGroup, Button, AvatarGroup, ListItem, JsonTree in LTR and RTL side by side (`TwentyUiReadingDirections.stories.tsx`) |

The focused fixtures import public twenty-ui entry points and use
`TwentyUiGalleryCard` for the light theme, mount marker, and `twenty-ui/style.css`.
`twenty-ui-reading-directions` imports the stylesheet directly instead: its dark
stories rely on the provider-less CSS-variable theme, and its two directions do
not fit the card's width.
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
| ImageInput | Native file picker activation and usable file contents are unavailable in the sandbox. The fixture checks forwarded file metadata, preview recovery, action callbacks, and supplied error changes. See the [ImageInput documentation](../../../../twenty-docs/ui/components/image-input.mdx). |
| Tabs | Activation fails on the missing `nativeEvent` for `composedPath` in both runtimes. |
| Popover, Dialog, AlertDialog | Opening fails while reading pointer contact data from the missing `nativeEvent`. |
| Menu | Opening fails on the missing `nativeEvent.pointerType` and pointer contact data. |
| Select | Opening fails on missing native event data and focus support. Preact can report only the last of these failures when the host coalesces sandbox errors. |
| Switch, Checkbox, Radio (standard and card), SegmentedControl | Activation attempts to construct an unavailable `PointerEvent`. `RadioCardReact` never gets that far: React drops the click handler Base UI adds through `React.cloneElement`, so only the group's focus handling fails on the missing `nativeEvent` for `composedPath`. |
| Slider | Thumbs stay hidden because the sandbox has no `ResizeObserver` to re-measure after the first geometry batch. |
| Tooltip | `TooltipReact` opens on hover but remains open after Escape because React drops the handlers Base UI adds through `React.cloneElement`. |
| Responsive hooks | The sandbox `window.matchMedia` answers for the widget's own box, so `useIsMobile` follows the widget width rather than the browser viewport: a widget 768px wide or narrower gets the mobile layout, and Button drops its hotkey hint, on any screen. `useIsTouchDevice` follows the primary input of the host device, so it is `false` under the desktop Chromium that runs these stories. The fixture asserts both at a 1024px and a 400px widget width. |

The worker DOM now provides `Node.contains`, `compareDocumentPosition`,
`getRootNode`, `Element.matches`, `closest`, `querySelector` backed by
`css-select`, `focus`/`blur` forwarding to page elements with a
`document.activeElement` that the host keeps in sync with the page's focus
inside the component and that clears when
the focused subtree is detached, and property accessors for boolean ARIA
attributes so React and Preact forward `true`/`false` instead of empty strings
and remove the attribute when the prop is cleared. `getAttribute` and the
selector engine read the remote properties React and Preact set, and the
selector engine matches the sandbox's custom element tags by their HTML tag
names and reads live control properties. `TooltipPreact` therefore covers hover
opening and Escape dismissal. Pointer leave still needs document-level
`mousemove` delivery for the safe polygon, and the compound tooltip's title and
description are not covered yet.

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
