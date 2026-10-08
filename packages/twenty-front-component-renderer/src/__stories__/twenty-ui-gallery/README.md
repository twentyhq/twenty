# Twenty UI renderer coverage

`TwentyUiGallery.stories.tsx` contains the component catalogs and focused
component stories. Each fixture has React and Preact stories built with
`createGalleryStory`, with an explicit bundle name, runtime, and play function.
Preact stories need Preact 11, which passes `ref` to function components as a
regular prop like React 19. Preact 10 hands that ref to the component instance,
so Dropdown-based popups never open there.
Typography composition checks constrained text, explicit links, semantic elements, refs and native focus handlers in both runtimes. Overflow tooltip popup acceptance still depends on renderer portal and geometry support.

Scenarios share their checks between runtimes where behavior matches. The story
file contains the metadata and named entries; `utils/` holds the story factory,
shared assertions, render checks, interaction checks, and known-failure
scenarios. Shared types live in `types/` and shared constants in `constants/`;
known-failure scenarios that assert sandbox errors declare the patterns they
require.
`createGalleryRenderTest` checks the exact set of expected failed components.
`createOverlayOpenTest` checks that a trigger opens its overlay and pins the
popup content as absent from the page. `createDropdownOpenTest` applies it to
the Dropdown-based popups.
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
| `twenty-ui-image-input`          | ImageInput (native chooser, readable files, preview URLs, reset and ownership cleanup)                                              |
| `twenty-ui-list-item`            | ListItem                                                                                                                            |
| `twenty-ui-settings-row`         | SettingsRow                                                                                                                         |
| `twenty-ui-tabs`                 | Tabs                                                                                                                                |
| `twenty-ui-overflowing-list`     | OverflowingList                                                                                                                     |
| `twenty-ui-phone-country-picker` | PhoneCountryPicker                                                                                                                  |
| `twenty-ui-currency-picker`      | CurrencyPicker                                                                                                                      |
| `twenty-ui-popover`              | Popover                                                                                                                             |
| `twenty-ui-dialog`               | Dialog                                                                                                                              |
| `twenty-ui-menu`                 | Menu                                                                                                                                |
| `twenty-ui-select`               | Select                                                                                                                              |
| `twenty-ui-dropdown`             | Dropdown                                                                                                                            |
| `twenty-ui-toast`                | Toast                                                                                                                               |
| `twenty-ui-alert-dialog`         | AlertDialog                                                                                                                         |
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

The Autocomplete fixture uses the public inline list interface to isolate input
behavior from popup support. Its Empty section runs Base UI's live-region marker
through a narrow worker TreeWalker that supports SHOW_TEXT, nextNode and
currentNode without callback filters; document Selection and DOM Range are
outside this scope.

## ImageInput file selection

`ImageInputFileSelection.stories.tsx` mounts two independent SDK-built renderers.
The native Chromium tests wait for a browser `filechooser` event after trusted
pointer, Enter and Space activation on both selection buttons. A synchronous
worker `input.click()` can consume its renderer's single-use activation while
the browser still has transient user activation, within one second of the host
click. Synthetic events and delayed calls do not grant activation.

Selected files cross the existing event transport as native `File` objects,
including metadata, `text()` and `arrayBuffer()` contents. Reset clears both the
native selection and the worker input's File references without invalidating a
File retained by the callback, so the same file can be selected again. The tests cover disabled and
uploading controls, empty chooser results, callback replacement, renderer
isolation and teardown. Empty results are supplied through Playwright's
intercepted chooser; operating-system dialog dismissal and other browser engines
are not covered by these tests.

A worker-created object URL assigned to `img.src` carries its `Blob` to the host.
Each mounted image owns a host URL and revokes it on source replacement,
explicit worker URL revocation or unmount. Applications still revoke their
worker URLs and own validation, upload, progress and cancellation. Other object
URL consumers are outside this adapter's scope. The public callback remains
`onUpload`; its API rename is separate.

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
| Popover, Dialog, AlertDialog, Menu, Select, Dropdown, CurrencyPicker, PhoneCountryPicker, CountrySelect, Autocomplete (React and Preact) | The trigger opens the overlay, but the popup portals into the sandbox `document.body`, which never reaches the host, so its content stays invisible. Search, selection, dismissal and focus restoration are not covered yet. |
| Slider | Thumbs stay hidden because the sandbox has no `ResizeObserver` to re-measure after the first geometry batch. |
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

The Autocomplete, CountrySelect and reading-directions fixtures live in their
own story files, so run them separately:

```sh
npx vitest run --config vitest.storybook.config.ts TwentyUiAutocomplete.stories.tsx
npx vitest run --config vitest.storybook.config.ts TwentyUiCountrySelect.stories.tsx
npx vitest run --config vitest.storybook.config.ts TwentyUiReadingDirections.stories.tsx
```

For native chooser coverage, serve Storybook on port 6008 after the same prebuild,
then run from `packages/twenty-front-component-renderer`:

```sh
node --import tsx --test scripts/front-component-stories/__tests__/image-input.browser.test.ts
```

Set `STORYBOOK_URL` to use another running Storybook URL. These tests use
Playwright's trusted browser input and chooser interception; `userEvent.upload`
in the gallery story covers selection handling only.
