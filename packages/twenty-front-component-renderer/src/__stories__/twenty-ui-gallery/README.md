# Twenty UI renderer coverage

`TwentyUiGallery.stories.tsx` contains the component catalogs and focused
component stories. Each fixture has React and Preact stories built with
`createGalleryStory`, with an explicit bundle name, runtime, and play function.
Preact stories need Preact 11, which passes `ref` to function components as a
regular prop like React 19. Preact 10 hands that ref to the component instance,
so Dropdown-based popups never open there.
The field-controls fixture checks native input/textarea refs and change targets, typed textarea render composition, Field labels and controlled multiline value updates in React and Preact.
Textarea auto-resize growth and shrinking remain known renderer failures. Geometry reads use cached host snapshots, so resetting inline height and reading scrollHeight in the same turn cannot measure the updated layout. The growth failure also reproduces with main's unchanged Textarea. The fixture pins them with the existing known-failure helper; these assertions do not count as resize acceptance. Standalone Textarea browser checks pass.

Popover composes Portal, Positioner, Popup, Arrow and Viewport. Its focused React/Preact cases check controlled trigger requests, native attributes, Button render composition, DOM refs and callback reasons. These checks do not establish popup visibility, geometry or dismissal support. The omitted-container popup still requires C04/C05/C07 renderer acceptance.

Typography composition checks constrained text, explicit links, semantic elements, refs and native focus handlers in both runtimes. Overflow tooltip popup acceptance still depends on renderer portal and geometry support.

Scenarios share their checks between runtimes where behavior matches. The story
file contains the metadata and named entries; `utils/` holds the story factory,
shared assertions, render checks, interaction checks, and known-failure
scenarios. Shared types live in `types/` and shared constants in `constants/`;
known-failure scenarios that assert sandbox errors declare the patterns they
require.
`createGalleryRenderTest` checks the exact set of expected failed components.
`createOverlayOpenTest` checks that a trigger opens its overlay and waits for
visible popup content. `createDropdownOpenTest` applies it to the Dropdown-based
popups.
`expectSandboxErrors` requires each listed known error and rejects any other
error. `expectAssertionToKeepFailing` pins an interaction that must have no
effect within the interaction timeout.

| Fixture                          | Components                                                                                                                          |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `twenty-ui-field-controls`       | Field, Input, InputGroup, Textarea                                                                                                  |
| `twenty-ui-number-stepper`       | NumberStepper (pointer stepping, selected-range paste, caret restoration, keyboard bounds, disabled/read-only state and forms)      |
| `twenty-ui-autocomplete`         | Autocomplete (caret keys, controlled editing, composition, filtering, disabled state, Empty; `TwentyUiAutocomplete.stories.tsx`)    |
| `twenty-ui-display-helpers`      | Text                                                                                                                                |
| `twenty-ui-avatar-controls`      | Avatar (fallback, pointer/keyboard activation and disabled state)                                                                   |
| `twenty-ui-avatar-image`         | Avatar (decoded images, broken-source fallback, replacement and unmount/remount)                                                    |
| `twenty-ui-image-input`          | ImageInput                                                                                                                          |
| `twenty-ui-list-item`            | ListItem                                                                                                                            |
| `twenty-ui-settings-row`         | SettingsRow                                                                                                                         |
| `twenty-ui-tabs`                 | Tabs                                                                                                                                |
| `twenty-ui-overflowing-list`     | OverflowingList                                                                                                                     |
| `twenty-ui-phone-country-picker` | PhoneCountryPicker                                                                                                                  |
| `twenty-ui-currency-picker`      | CurrencyPicker                                                                                                                      |
| `twenty-ui-popover`              | Popover                                                                                                                             |
| `twenty-ui-dialog`               | SDK `openCommandConfirmationModal` confirmation request                                                                             |
| `twenty-ui-menu`                 | Menu                                                                                                                                |
| `twenty-ui-select`               | Select                                                                                                                              |
| `twenty-ui-portals`              | Body portal callbacks, removal, nearby overflow, menu placement and confinement                                                     |
| `twenty-ui-dropdown`             | Dropdown                                                                                                                            |
| `twenty-ui-toast`                | Toast                                                                                                                               |
| `twenty-ui-switch`               | Switch (interaction coverage in addition to the original input gallery)                                                             |
| `twenty-ui-checkbox`             | Checkbox                                                                                                                            |
| `twenty-ui-radio-group`          | RadioGroup, Radio (standard and card)                                                                                               |
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

Body portals render in a host layer outside widget scroll frames, clipped to
200px around the component, and the worker's `window.visualViewport` reports
that area so Floating UI popups flip and size themselves to fit it. The portal
fixture covers callbacks, removal, menu placement, interface zoom, and an
oversized portal that stays clipped while a host control remains usable.

The Autocomplete fixture uses the public inline list interface to isolate input
behavior from popup support. Its Empty section runs Base UI's live-region marker
through a narrow worker TreeWalker that supports SHOW_TEXT, nextNode and
currentNode without callback filters; document Selection and DOM Range are
outside this scope.

## Dialog policy

Direct app-owned `Dialog`/`AlertDialog` modality and native browser dialog/popover activation are prohibited in front components. Their standalone Twenty UI APIs have dedicated unit and browser stories. Front components use SDK `openCommandConfirmationModal`, whose structured title, subtitle and confirm-button options are rendered by the host. The Dialog fixture checks the confirmation request. Result handling and actual host modal focus, restoration, dismissal and teardown acceptance remain part of the renderer integration work. No direct Dialog or AlertDialog gallery fixture is retained as a compatibility target.

## Known sandbox limitations

An invisible popup is not a compatibility pass.

These are compatibility regression stories, not assertions that the components
work fully in the sandbox. Scenarios pin the current behavior exactly: a
scenario that reaches a gap asserts what the component reports, and one that
raises errors requires those specific errors and rejects unrelated ones. A fix
must change the corresponding story to assert successful behavior; do not keep
or broaden an obsolete expectation. No stories are skipped or marked as
expected-to-fail by the runner.

| Component                                                                                             | Current limitation                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ImageInput                                                                                            | Native file picker activation and usable file contents are unavailable in the sandbox. The fixture checks forwarded file metadata, preview recovery, action callbacks, and supplied error changes. See the [ImageInput documentation](../../../../twenty-docs/ui/components/input/image-input.mdx).                                                                                                                                                         |
| Popover, Menu, Select, Dropdown, CurrencyPicker, PhoneCountryPicker, CountrySelect (React and Preact) | Body portal content reaches the host inside the component portal area. These fixtures cover opening and visible content; search, selection, dismissal and focus restoration are not covered yet.                                                                                                                                                                                                                                                            |
| Slider                                                                                                | Thumbs stay hidden because the sandbox has no `ResizeObserver` to re-measure after the first geometry batch.                                                                                                                                                                                                                                                                                                                                                |
| Responsive hooks                                                                                      | The sandbox `window.matchMedia` answers for the widget's own box, so `useIsMobile` follows the widget width rather than the browser viewport: a widget 768px wide or narrower gets the mobile layout, and Button drops its hotkey hint, on any screen. `useIsTouchDevice` follows the primary input of the host device, so it is `false` under the desktop Chromium that runs these stories. The fixture asserts both at a 1024px and a 400px widget width. |

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
names and reads live control properties. `TooltipReact` and `TooltipPreact` cover
hover opening, keyboard focus,
Escape dismissal, compound title and description content, and typed detached
handle payloads through the public Tooltip interface. Pointer leave still needs
`mousemove` delivery from outside the component for the safe polygon.

A page event crosses to the worker when the element it targets, or one of that
element's ancestors in the component, listens for that event type. It crosses
once, from the innermost listening element, and the worker dispatches it at the
element the page event targeted. It bubbles when the page event bubbled, except
React's per-element `mouseenter`, `mouseleave`, `pointerenter` and
`pointerleave`, which reach each listening element separately. `target`,
`currentTarget`, `relatedTarget` and `stopPropagation()` therefore behave as on
the page, and `document` listeners receive the events that cross. An event
carries a control's `value` only once the browser has applied the user's change
(`input`, `change`, `click`, `keyup`, `blur` and `focusout`), `checked` only
after activation (the same events without `keyup`, which precedes a Space
activation), and a media element's `muted` only on `volumechange`, so a
snapshot taken before the change never overwrites what the user did. The SDK
registers handlers written in JSX and handlers added through
`React.cloneElement` as element listeners in both runtimes, the element's own
handlers first, with capture handlers on the capture phase, and keeps
`event.preventBaseUIHandler()` working as Base UI's prop merging does. That is
how the OverflowingList popup and event isolation stories, `TooltipReact`,
`RadioCardReact` and `FieldControlsReact` pass; the
`div` propagation and clone handler stories pin the delivery itself.

Forwarded events are `PointerEvent`, `MouseEvent`, `KeyboardEvent`,
`InputEvent`, `WheelEvent`, `FocusEvent` or `ClipboardEvent` instances that
carry React's synthetic event surface (`nativeEvent`, `isDefaultPrevented()`,
`isPropagationStopped()`, `persist()`), and those constructors exist in the
worker. `HTMLElement.click()` dispatches a local click, and a click dispatched
inside the worker on a checkbox or radio input toggles it and fires `input` and
`change`, which is how Base UI's Switch, Checkbox and Radio variants
activate. Tabs, SettingsRow, Switch, Checkbox and RadioGroup therefore cover
activation and disabled items in both runtimes. Events that happen outside the
component never reach the worker, so dismissal on a press elsewhere on the page
is not covered.

Once the remaining gaps are fixed, extend the stories to verify keyboard
navigation, dismissal, and focus restoration across overlay components. The fixtures
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

The Autocomplete, CountrySelect and reading-directions fixtures live in their
own story files, so run them separately:

```sh
npx vitest run --config vitest.storybook.config.ts TwentyUiAutocomplete.stories.tsx
npx vitest run --config vitest.storybook.config.ts TwentyUiCountrySelect.stories.tsx
npx vitest run --config vitest.storybook.config.ts TwentyUiReadingDirections.stories.tsx
```

Section and CommandBlock composition is checked in the Typography and DataDisplay
catalogs for React and Preact. The checks cover node titles/actions, heading
levels, description line limits and optional focus, code semantics, native
handlers, refs, and element/callback render composition. Description popup
visibility and dismissal in the sandbox remain part of the existing portal and
geometry acceptance work; standalone Section stories verify those behaviors.
