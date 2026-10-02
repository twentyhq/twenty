# Twenty UI renderer coverage

`TwentyUiGallery.stories.tsx` contains the component catalogs and focused
component stories. Each fixture has React and Preact stories built with
`createGalleryStory`, with an explicit bundle name, runtime, and play function.
Scenarios share their checks between runtimes where behavior matches. The story
file contains the metadata and named entries; `utils/` holds the story factory,
shared assertions, render checks, interaction checks, and known-failure
scenarios. Shared types and error patterns live in `types/` and `constants/`.
`createGalleryRenderTest` checks the exact set of expected failed components.
`createOverlayOpenTest` checks that a trigger opens its overlay and pins the
popup content as absent from the page. `expectSandboxErrors` requires at least
one known error and can allow additional known errors without requiring them
to occur.

| Fixture | Components |
| --- | --- |
| `twenty-ui-field-controls` | Field, Input, InputGroup, Textarea |
| `twenty-ui-number-stepper` | NumberStepper (keyboard bounds, disabled/read-only state, named form values and submission) |
| `twenty-ui-display-helpers` | Text |
| `twenty-ui-image-input` | ImageInput |
| `twenty-ui-list-item` | ListItem |
| `twenty-ui-settings-row` | SettingsRow |
| `twenty-ui-tabs` | Tabs |
| `twenty-ui-overflowing-list` | OverflowingList |
| `twenty-ui-popover` | Popover |
| `twenty-ui-dialog` | Dialog |
| `twenty-ui-menu` | Menu |
| `twenty-ui-select` | Select |
| `twenty-ui-dropdown` | Dropdown |
| `twenty-ui-toast` | Toast |
| `twenty-ui-alert-dialog` | AlertDialog |
| `twenty-ui-switch` | Switch (interaction coverage in addition to the original input gallery) |
| `twenty-ui-checkbox` | Checkbox |
| `twenty-ui-radio-group` | RadioGroup, Radio (standard and card) |
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
work fully in the sandbox. Scenarios pin the current behavior exactly: a
scenario that reaches a gap asserts what the component reports, and one that
raises errors requires those specific errors and rejects unrelated ones. A fix
must change the corresponding story to assert successful behavior; do not keep
or broaden an obsolete expectation. No stories are skipped or marked as
expected-to-fail by the runner.

| Component | Current limitation |
| --- | --- |
| Field controls | Textarea's cloned render element loses its change handler in React, so `FieldControlsReact` reports an empty `Notes` value. |
| NumberStepper | Pointer stepping fails because the worker input does not implement `setSelectionRange`. Text editing fails because forwarded events lack the `nativeEvent.defaultPrevented` Base UI reads. Pasting is not covered: without `selectionStart`/`selectionEnd`, Base UI inserts the pasted text around the whole value and reports that number, then its caret restore throws from a layout effect, which unmounts the React tree and stops Preact rendering. Separate React and Preact stories assert the pointer and typing gaps and successful keyboard bounds, disabled/read-only state, named form values and submission. |
| ImageInput | Native file picker activation and usable file contents are unavailable in the sandbox. The fixture checks forwarded file metadata, preview recovery, action callbacks, and supplied error changes. See the [ImageInput documentation](../../../../twenty-docs/ui/components/image-input.mdx). |
| Radio card | `RadioCardReact` cannot activate an option because React drops the click handler Base UI adds through `React.cloneElement` on its `render={<div />}` element. |
| Popover, Dialog, AlertDialog, Menu, Select | The trigger opens the overlay, but the popup portals into the sandbox `document.body`, which never reaches the host, so its content stays invisible. Dismissal and focus restoration are not covered yet. |
| OverflowingList | Both runtimes measure, resize, and unmount the inline list, and keep rendering afterwards. A scoped light provider keeps popup portals inside the connected remote root and matches the gallery theme. Popup lifecycle checks verify selection, dismissal, focus restoration, and independent lists while requiring the missing native pointer width error; missing native `defaultPrevented` data and event constructor errors are optional. Focus restoration can also call a stale host listener, which is checked with the existing exact host-error assertion. Separate event isolation failure stories verify that opening the trigger activates the surrounding host, then check that popup selection adds no host activation. Full popup compatibility remains blocked on the event bridge work in [#26356](https://github.com/twentyhq/twenty/pull/26356). |
| Dropdown | The content looks up its search field through `dataset` on the popup ref, which has none in the sandbox. React throws when the popup mounts, and the uncaught error unmounts the component before the trigger reports the open state. Preact applies the ref to the `PopoverPopup` component instance at mount, so the lookup throws inside Preact's render queue: the rejection never reaches the host and Preact stops re-rendering, so the trigger never opens. |
| ListItem | `ListItemPreact` handles selection, the disabled item and the submenu row, but the overflow tooltip's Floating UI `contains(parent, child)` check receives a parent without `contains` and throws. |
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

Forwarded events are `PointerEvent`, `MouseEvent`, `KeyboardEvent`,
`InputEvent`, `WheelEvent`, `FocusEvent` or `ClipboardEvent` instances that
carry React's synthetic event surface (`nativeEvent`, `isDefaultPrevented()`,
`isPropagationStopped()`, `persist()`), and those constructors exist in the
worker. `HTMLElement.click()` dispatches a local click, and a click dispatched
inside the worker on a checkbox or radio input toggles it and fires `input` and
`change`, which is how Base UI's Switch, Checkbox and Radio variants
activate. Tabs, SettingsRow, Switch, Checkbox and RadioGroup therefore cover
activation and disabled items in both runtimes. Keyboard navigation and
document-level dismissal still need document event delivery.

Once the remaining gaps are fixed, extend the stories to verify keyboard
navigation, and overlay content, dismissal, and focus restoration. The fixtures
already include the controlled state, compound parts, and callback output for
those checks. Passing display, ListItem, and Toast stories verify rendering/CSS
or interaction behavior directly.

## Run

From the repository root, build the fixture dependencies and sandbox with
`npx nx run twenty-front-component-renderer:storybook:prebuild`.
Then, from `packages/twenty-front-component-renderer`, run:

```sh
npx vitest run --config vitest.storybook.config.ts TwentyUiGallery.stories.tsx
```
