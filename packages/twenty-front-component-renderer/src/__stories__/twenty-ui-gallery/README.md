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

| Fixture                          | Components                                                                                                                          |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `twenty-ui-field-controls`       | Field, Input, InputGroup, Textarea                                                                                                  |
| `twenty-ui-number-stepper`       | NumberStepper (keyboard bounds, disabled/read-only state, named form values and submission)                                         |
| `twenty-ui-display-helpers`      | Text                                                                                                                                |
| `twenty-ui-avatar-controls`      | Avatar (fallback, pointer/keyboard activation and disabled state)                                                                   |
| `twenty-ui-avatar-image`         | Avatar (decoded images, broken-source fallback, replacement and unmount/remount)                                                    |
| `twenty-ui-image-input`          | ImageInput                                                                                                                          |
| `twenty-ui-list-item`            | ListItem                                                                                                                            |
| `twenty-ui-tabs`                 | Tabs                                                                                                                                |
| `twenty-ui-overflowing-list`     | OverflowingList                                                                                                                     |
| `twenty-ui-phone-country-picker` | PhoneCountryPicker                                                                                                                  |
| `twenty-ui-popover`              | Popover                                                                                                                             |
| `twenty-ui-menu`                 | Menu                                                                                                                                |
| `twenty-ui-select`               | Select                                                                                                                              |
| `twenty-ui-toast`                | Toast                                                                                                                               |
| `twenty-ui-alert-dialog`         | AlertDialog                                                                                                                         |
| `twenty-ui-switch`               | Switch (interaction coverage in addition to the original input gallery)                                                             |
| `twenty-ui-tooltip`              | Tooltip (convenience and compound APIs)                                                                                             |
| `twenty-ui-responsive-hooks`     | useIsMobile, useIsTouchDevice, Button hotkeys                                                                                       |
| `twenty-ui-reading-directions`   | Callout, ButtonGroup, Button, AvatarGroup, ListItem, JsonTree in LTR and RTL side by side (`TwentyUiReadingDirections.stories.tsx`) |
| `twenty-ui-country-select`       | CountrySelect (`TwentyUiCountrySelect.stories.tsx`)                                                                                 |

The focused fixtures import public twenty-ui entry points and use
`TwentyUiGalleryCard` for the light theme, mount marker, and `twenty-ui/style.css`.
`twenty-ui-reading-directions` imports the stylesheet directly instead: its dark
stories rely on the provider-less CSS-variable theme, and its two directions do
not fit the card's width.
The story builder resolves that stylesheet to the individual build's CSS so
class names match the JavaScript used by the sandbox. Importing CSS through the
shared card also exercises the SDK's CSS injection and the renderer's style bridge.

The Avatar image browser tests also hold real SVG responses until after source
replacement or unmount. A test-only observer waits for the native image's load
event before checking that the replaced source's response cannot replace the
fallback, and that a response arriving after unmount does not break the
remounted Avatar. The Storybook Vite fixture middleware owns these pending
responses and closes them on teardown or timeout. These delayed-response steps
run only in test mode; the regular and static stories use data images and
retain working source controls, fallback, replacement and unmount/remount checks.

## Known sandbox limitations

These are compatibility regression stories, not assertions that the components
work fully in the sandbox. Scenarios that raise errors require specific errors and
reject unrelated ones, following the existing gallery convention. Known
precursor errors are optional because the host can coalesce worker errors into
a single state update. A fix must change the corresponding story to assert
successful behavior; do not keep or broaden an obsolete error expectation.
No stories are skipped or marked as expected-to-fail by the runner.

| Component                                                     | Current limitation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Field controls                                                | Forwarded events lack the `nativeEvent` Base UI reads for `composedPath`. Textarea's cloned render element loses its change handler in React. The value report checks the state received by the component after typing.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| NumberStepper                                                 | Pointer stepping fails because the worker input does not implement `setSelectionRange`. Text editing fails because forwarded events lack the `nativeEvent.defaultPrevented` Base UI reads. Pasting is not covered: without `selectionStart`/`selectionEnd`, Base UI inserts the pasted text around the whole value and reports that number, then its caret restore throws from a layout effect, which unmounts the React tree and stops Preact rendering. Separate React and Preact stories assert the pointer and typing gaps and successful keyboard bounds, disabled/read-only state, named form values and submission.                                                                                                                                                                                                                                          |
| ImageInput                                                    | Native file picker activation and usable file contents are unavailable in the sandbox. The fixture checks forwarded file metadata, preview recovery, action callbacks, and supplied error changes. See the [ImageInput documentation](../../../../twenty-docs/ui/components/input/image-input.mdx).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| Tabs                                                          | Activation fails on the missing `nativeEvent` for `composedPath` in both runtimes.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| Popover, Dialog, AlertDialog                                  | Opening fails while reading pointer contact data from the missing `nativeEvent`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| OverflowingList                                               | Both runtimes measure, resize, and unmount the inline list, and keep rendering afterwards. A scoped light provider keeps popup portals inside the connected remote root and matches the gallery theme. Popup lifecycle checks verify selection, dismissal, focus restoration, and independent lists while requiring the missing native pointer width error; missing native `defaultPrevented` data and event constructor errors are optional. Focus restoration can also call a stale host listener, which is checked with the existing exact host-error assertion. Separate event isolation failure stories verify that opening the trigger activates the surrounding host, then check that popup selection adds no host activation. Full popup compatibility remains blocked on the event bridge work in [#26356](https://github.com/twentyhq/twenty/pull/26356). |
| PhoneCountryPicker                                            | Both runtimes render the triggers, flags, and disabled state. Opening fails while reading pointer contact data from the missing `nativeEvent`. In React the popup still mounts, and the Dropdown search effect then reads `dataset`, which sandbox elements lack; the uncaught error unmounts the React tree, so the React story requires that error and keeps the pointer error optional. See the [PhoneCountryPicker documentation](../../../../twenty-docs/ui/components/input/phone-country-picker.mdx).                                                                                                                                                                                                                                                                                                                                                        |
| Menu                                                          | Opening fails on the missing `nativeEvent.pointerType` and pointer contact data.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| Select                                                        | Opening fails on missing native event data and focus support. Preact can report only the last of these failures when the host coalesces sandbox errors.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| CountrySelect                                                 | Opening fails while reading pointer contact data from the missing `nativeEvent`. React still mounts the popup, and the Dropdown search target then reads `dataset`, which worker elements do not provide, so that error is allowed without being required; Preact stops at the opening error. The fixture checks the selected values and decorative flags, then clicks the disabled trigger and, after a settle delay, requires the opening error alone, so a popup mounted by React fails the story. Clicking an enabled trigger then asserts the opening error.                                                                                                                                                                                                                                                                                                   |
| Switch, Checkbox, Radio (standard and card), SegmentedControl | Activation attempts to construct an unavailable `PointerEvent`. `RadioCardReact` never gets that far: React drops the click handler Base UI adds through `React.cloneElement`, so only the group's focus handling fails on the missing `nativeEvent` for `composedPath`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| Slider                                                        | Thumbs stay hidden because the sandbox has no `ResizeObserver` to re-measure after the first geometry batch.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| Tooltip                                                       | `TooltipReact` opens on hover but remains open after Escape because React drops the handlers Base UI adds through `React.cloneElement`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Responsive hooks                                              | The sandbox `window.matchMedia` answers for the widget's own box, so `useIsMobile` follows the widget width rather than the browser viewport: a widget 768px wide or narrower gets the mobile layout, and Button drops its hotkey hint, on any screen. `useIsTouchDevice` follows the primary input of the host device, so it is `false` under the desktop Chromium that runs these stories. The fixture asserts both at a 1024px and a 400px widget width.                                                                                                                                                                                                                                                                                                                                                                                                         |

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

The CountrySelect and reading-directions fixtures live in their own story
files, so run them separately:

```sh
npx vitest run --config vitest.storybook.config.ts TwentyUiCountrySelect.stories.tsx
npx vitest run --config vitest.storybook.config.ts TwentyUiReadingDirections.stories.tsx
```
