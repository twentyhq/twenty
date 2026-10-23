# Twenty UI renderer coverage

`TwentyUiGallery.stories.tsx` contains the component catalogs and focused
component stories. Each fixture has React and Preact stories built with
`createGalleryStory`, with an explicit bundle name, runtime, and play function.
Preact stories need Preact 11, which passes `ref` to function components as a
regular prop like React 19. Preact 10 hands that ref to the component instance,
so Dropdown-based popups never open there.
The layout fixtures mirror a bounded set of stylesheet and inherited layout properties, including logical paddings, borders and margins and individual transforms, for elements the worker already measures, plus native positioned ancestors and size observations. Reading a computed style enrolls an element only when one of its children is already measured, so container properties such as gaps follow the host. Theme custom properties are not mirrored, so they keep resolving through `var()` on the host, while inline custom properties still read back from the element's own style. Worker `ResizeObserver` entries report content, border and device-pixel content boxes from owned host snapshots, and `document.body` and `document.documentElement` report the renderer root box. They deliver the first valid measurement and later size changes, report a zero size when a measured target leaves the document, resume after it is reinserted, and stop after unobserve or disconnect. SVG graphics inside an `svg` element report their host bounding box and its later changes, while the outermost `svg` reports its CSS box (`Geometry.stories.tsx`). Position-only updates still use the existing geometry update path rather than resize notifications.

Native Slider range inputs receive their minimum, maximum and step, so browser keyboard defaults and worker callbacks agree. A Slider's own capture remains in place when its parent has a pointer handler.

The field-controls fixture checks native input/textarea refs and change targets, typed textarea render composition, Field labels, controlled multiline value updates, positive Textarea height growth and shrink, and reflow after width changes in React and Preact. Auto-resize reads the host's intrinsic content measurement after a local block-size reset and reconciles delayed content measurements through the geometry update listener. Caller sizing overrides and detached controls end that reconciliation.

The standalone Toast countdown fixture checks remaining time after repeated content updates, zero-duration persistence, manual dismissal, progress suppression and restart, and overlapping hover/focus pauses in React and Preact. It does not cover `updateToast`, `ToastProvider` or `Toaster` in the worker. The SDK snackbar stories check the separate host notification API.

NumberField checks locale formatting and localized paste, controlled empty values, uncontrolled typing, bounds, keyboard commits, pointer value changes, callback event details, accessible labels, native forms, refs and render composition in both runtimes. Sequential typing after clearing a formatted value can reset the caret and insert subsequent digits before earlier input. Formatted pointer edits can also restore stale display values when host blur races the worker update. Pointer button release does not emit its commit callback, although host blur can emit an input-blur commit. ScrubArea can enter its scrubbing state, but drag movement and release do not reach the worker window listeners; pointer lock and the custom scrub cursor are also unavailable. These renderer limits apply independently of the standalone React NumberField browser checks.

Popover composes Portal, Positioner, Popup, Arrow and Viewport. Its focused React/Preact cases check controlled trigger requests, native attributes, Button render composition, DOM refs and callback reasons. These checks do not establish popup visibility, geometry or dismissal support. The omitted-container popup still requires C04/C05/C07 renderer acceptance.

OverflowingList keeps fitting items in its compact row and shows the complete list in its popup. The original fixture covers full popup contents and default event isolation. The `twenty-ui-overflowing-list-api` fixture exercises controlled and defaultOpen state, callback reasons and native events, cancelable Escape, root/trigger/popup refs with render composition, and public `actionsRef.close()` and `actionsRef.unmount()` in React and Preact. The deferred-close example retains the closed popup after `preventUnmountOnClose()`, releases it when the caller finishes its exit, and opens it again. The trigger and popup block click, mousedown, pointerdown, keydown and keyup by default. Each supplied handler replaces its default, so the API fixture explicitly allows trigger and popup clicks to bubble while recording their native event type. These API cases do not complete the separate C04 portal, C05 measurement/geometry, C06 scrolling or C07 dismissal acceptance. Existing OverflowingList responsive measurement and independent-instance evidence remains with C05.

In standalone React, when a popup click override allows bubbling, the installed Base UI FloatingPortal can dispatch that click to a surrounding React ancestor twice, with the same native event in both callbacks. This is reproduced by a plain Popover. OverflowingList preserves the supplied popup callback without promising one ancestor callback per native popup event when bubbling is enabled.

The SDK registers native handlers on physical elements. The API fixture overrides the default click blocking and asserts native trigger bubbling and popup callback preservation. Logical portal bubbling to a surrounding React ancestor remains a separate C04 gap in React and Preact: the diagnostic parent count reaches 1 after the trigger click and stays at 1 after the popup item click, instead of reaching 2.

Dropdown checks controlled opening, native action refs and Button render composition, disabled callback suppression, action callbacks, page navigation, option selection and click-to-close in both runtimes. The portal fixture preserves all 16 rows and checks attachment along the physical collision side, overlap with the trigger and confinement to the owner portal area. A temporary constrained long-menu probe passed End-key focus and scrolling in both runtimes: a 128px popup scrolled to 386px and kept the last item visible. Outside-host dismissal remains a C07 renderer limitation. Clicking the host action invokes that action, while Dropdown remains expanded with its popup mounted. Its picker page checks initial search focus, a single Tab stop across option and action rows, arrow navigation and Tab reentry to the last focused row. Search preview clears when focus moves to a row, action or sibling button outside a popup whose outside dismissal is canceled, stays cleared during a keyed reorder, and returns when search regains focus. Nonempty-query Enter selects the first eligible option. Escape and Back focus restoration are not established by these checks.

Typography composition checks constrained text, explicit links, semantic elements, refs and native focus handlers in both runtimes. Overflow tooltip popup acceptance still depends on renderer portal and geometry support.

ListItemButton checks native action activation, selected state, refs and events, disabled and focusable disabled behavior, ordinary bubbling, caller-owned propagation boundaries, and independent sibling controls in React and Preact. ListItem keeps its default div presentational, including visual disabled, selected and focused state and caller-owned content. Its React/Preact cases check native button/link owners, actual root refs, pointer and keyboard activation, focus handlers, disabled native buttons, event bubbling and explicit propagation boundaries. URL text stays plain unless the caller supplies a link. Dropdown.ActionItem checks visible pointer activation, disabled behavior and click-to-close. Popup keyboard navigation, outside dismissal and focus restoration remain outside this fixture. The retained overflow-tooltip check re-enters after renderer measurements arrive, so it does not establish first-hover geometry acceptance.

Tag and Status retain their presentational span when a native click handler is supplied. Their focused React/Preact fixtures check explicit native button/link composition, keyboard activation, disabled owners, refs, caller-owned links and native handlers. Tag checks positive truncation and native padding styles; Status checks controlled loading, caller-owned busy state and a decorative loader without an implicit live region.

Card composition checks native part props and DOM refs, customized anatomy, ordinary display semantics, independent nested controls, button keyboard activation and disabled state, and explicit link ownership in both runtimes.

RadioGroup checks controlled and uncontrolled selection, disabled skipping and looping, arrow selection in vertical and horizontal layouts, RTL direction, and Space activation. Enter does not select a radio. `Radio.Root` and `Radio.Indicator` preserve render state, native props and registered remote HTML refs, whose tag names use the `HTML-` prefix. Host queries separately verify the composed fieldset, default div card and explicit native button card. Descendant native forms retain named radio values and required validation before and after a choice. External form association is filtered at the host boundary until renderer-scoped ownership is supported.

SegmentedControl is imported from `twenty-ui/components/input` and presents an accessible exclusive-choice radio group without tab panels. Its disabled options are skipped during arrow selection. Radio arrows select the focused choice; Dropdown.SelectionGroup arrows only move focus.

AvatarGroup checks derived counts, partially loaded totals, custom overflow and surviving keyed child state. Its native button and link (`target="_blank"`) verify refs, focus and pointer/keyboard activation in React and Preact.

Badge checks ordinary node content, compact sizes, colors and circle shape. Its React and Preact fixtures keep count clamping and zero visibility in the caller, and verify native span attributes, refs and pointer handlers plus explicit button and link render composition with keyboard activation.

Progress composes Root, Track, Indicator, Label and Value alongside the ProgressBar and ProgressRing presets. The shared React and Preact fixture covers native names, attributes, refs, render composition and pointer handlers, nonzero minima, changing ranges and values, clamped boundaries, indeterminate progress and agreement between bar fill and ring geometry. The fixture also checks zero and complete fill and a minimum fill that stays below the full width of a narrow track. SVG bindings currently omit the `focusable` attribute; these cases verify `aria-hidden` and that keyboard Tab skips the decorative SVG.

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

| Fixture                          | Components                                                                                                                              |
| -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| `twenty-ui-field-controls`       | Field, Input, InputGroup, Textarea                                                                                                      |
| `twenty-ui-number-stepper`       | NumberStepper (pointer stepping, selected-range paste, caret restoration, keyboard bounds, disabled/read-only state and forms)          |
| `twenty-ui-number-field`         | NumberField (locale formatting and paste, controlled/uncontrolled values, callback details, native forms and refs, bounds and render composition) |
| `twenty-ui-autocomplete`         | Autocomplete (caret keys, controlled editing, composition, filtering, disabled state, Empty; `TwentyUiAutocomplete.stories.tsx`)        |
| `twenty-ui-autocomplete-parts`   | Autocomplete grouped objects, popup parts, native refs/render, controlled updates, Clear, selection and cancelable Escape              |
| `twenty-ui-display-helpers`      | Text                                                                                                                                    |
| `twenty-ui-avatar-controls`      | Avatar (stable presentational root, compound fallback, refs, explicit button/link composition and native keyboard/disabled behavior)    |
| `twenty-ui-avatar-group`         | AvatarGroup (derived and partial totals, custom overflow, keyed child state, native refs and explicit button/link composition)          |
| `twenty-ui-badge`                | Badge (node content, appearance, caller-owned counts, native span refs and explicit button/link composition)                             |
| `twenty-ui-tag-controls`         | Tag (stable presentational root, positive truncation, native spacing, node content, refs and explicit button/link composition)          |
| `twenty-ui-status-controls`      | Status (stable presentational root, loading/busy state, node content, refs and explicit button/link composition)                        |
| `twenty-ui-avatar-image`         | Avatar Root/Image/Fallback (image labels/attributes/refs, loading callbacks, decoded images, fallback, replacement and unmount/remount) |
| `twenty-ui-image-input`          | ImageInput (native chooser, readable files, preview URLs, reset and ownership cleanup) |
| `twenty-ui-list-item`            | ListItemButton and ListItem (native action composition, visual rows, explicit button/link/Dropdown.ActionItem owners, refs/events/focus/keyboard, disabled behavior and sibling controls)            |
| `twenty-ui-settings-row`         | SettingsRow                                                                                                                             |
| `twenty-ui-tabs`                 | Tabs and TabButton                                                                                                                      |
| `twenty-ui-overflowing-list`     | OverflowingList (complete popup contents, compact row and default event isolation)                                 |
| `twenty-ui-overflowing-list-api` | OverflowingList (controlled/defaultOpen state, callback details and cancellation, native refs and render composition)                  |
| `twenty-ui-phone-country-picker` | PhoneCountryPicker                                                                                                                      |
| `twenty-ui-currency-picker`      | CurrencyPicker                                                                                                                          |
| `twenty-ui-progress`           | Progress parts, ProgressBar, ProgressRing and MetricRow (native composition, range normalization, indeterminate values and geometry)      |
| `twenty-ui-popover`              | Popover                                                                                                                                 |
| `twenty-ui-card-composition`     | Card (native parts and refs, render composition, display semantics, button/link ownership and nested controls)                          |
| `twenty-ui-dialog`               | SDK `openCommandConfirmationModal` confirmation request                                                                                 |
| `twenty-ui-select`               | Select                                                                                                                                  |
| `twenty-ui-portals`              | Body portal callbacks, removal, nearby overflow, menu placement and confinement                                                         |
| `twenty-ui-dropdown`             | Dropdown (controlled opening, action refs and callbacks, disabled actions, page navigation, picker Tab stop and selection)                                                                                                               |
| `twenty-ui-toast`                | Toast                                                                                                                                   |
| `twenty-ui-switch`               | Switch (interaction coverage in addition to the original input gallery)                                                                 |
| `twenty-ui-checkbox`             | Checkbox                                                                                                                                |
| `twenty-ui-radio-group`          | RadioGroup, Radio Root/Indicator and styled cards, SegmentedControl                                                                     |
| `twenty-ui-tooltip`              | Tooltip (convenience and compound APIs)                                                                                                 |
| `twenty-ui-responsive-hooks`     | useIsMobile, useIsTouchDevice, Button hotkeys                                                                                           |
| `twenty-ui-reading-directions`   | Callout, ButtonGroup, Button, AvatarGroup, ListItem, JsonTree in LTR and RTL side by side (`TwentyUiReadingDirections.stories.tsx`)     |
| `twenty-ui-country-select`       | CountrySelect (`TwentyUiCountrySelect.stories.tsx`)                                                                                     |

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
Both runtimes also pin the current retained-image and responsive-source gaps
described below. The controls fixture uses
native buttons and an anchor through `render`; the anchor targets a local
fragment with `target="_self"` and checks pointer and Enter activation without changing navigation
policy. Callback refs expose the renderer's registered HTML element proxies,
whose tag names use the `HTML-` prefix.
Shorthand Avatar content is decorative by default; a nonempty `imageProps.alt`
labels its image and fallback.

Avatar's default preloaded `src` path decodes visible images and supports image
labels, custom image/fallback rendering, refs, status/native load callbacks,
replacement and fallback in both runtimes. The host image element currently
forwards only `src`, `alt`, `width` and `height` among image-specific properties;
`srcSet`, `sizes`, `loading`, `decoding` and `referrerPolicy` do not reach it.
The detached preloader accepts responsive sources, so a `srcSet`-only Avatar
reports loaded while its host image has no source and a zero natural width.
The fixture pins this as an unsupported visible-image case.

`keepMounted` with the fixture's caller-supplied `render` and loading callback
also remains unsupported. Its native host image decodes to the expected width,
but the worker element has no `complete` or `naturalWidth` readback. Base UI
therefore returns to loading after the callback updates its parent, leaving the
decoded image hidden and the fallback visible. The fixture pins that failure
and checks recovery when returning to the default preload mode. These boundary
assertions do not establish responsive-source or retained-image acceptance.

Body portals render in a host layer outside widget scroll frames, clipped to
200px around the component, and the worker's `window.visualViewport` reports
that area so Floating UI popups flip and size themselves to fit it. The portal
fixture covers callbacks, removal, menu placement, interface zoom, and an
oversized portal that stays clipped while a host control remains usable.

The string Autocomplete fixture uses the public inline list interface for caret
editing, controlled updates, IME confirmation, filtering and Empty. Its Empty
section runs Base UI's live-region marker through a narrow worker TreeWalker
that supports SHOW_TEXT, nextNode and currentNode without callback filters;
document Selection and DOM Range are outside this scope.

The grouped object fixture composes Portal, Positioner and Popup separately.
Its React/Preact cases require visible popup content and check native input refs
and element render composition, group filtering and empty results, item labels
and selection callbacks, controlled external updates, Clear, keyboard highlight
reasons, and cancelable Escape dismissal. The fixed Positioner configuration is
forwarded. Separate React/Preact probes pass basic bottom/start placement with
an 8px offset and nonzero visible host geometry. They do not establish collision
handling or placement under scrolling and zoom.

Three renderer gaps remain outside that positive coverage. A strict outside-press
success probe fails in both runtimes: the host button activates once, but the
popup remains open because events outside the owned component do not reach the
worker. C07 owns that dismissal transport. A separate strict native-input
semantics probe also fails in both runtimes after a controlled update while
closed. Base UI compares the registered element's tag name with `INPUT`, while
the worker retains `HTML-INPUT` for remote DOM transport. It consequently treats
the input as a custom control and removes its combobox role and expanded state
while closed. The role returns while the popup is open, and the Trigger retains
its controlled expanded state. A strict scrolling probe highlights the final
option in a 40-item list after keyboard navigation, but the option stays below
the host list's visible bounds in both runtimes. This leaves the C06 scroll
transport incomplete. No tag-name override or known-failure acceptance pin is
introduced. These gaps and the remaining C05/C06/C07 work prevent these stories
from establishing integrated V1 acceptance.

## ImageInput file selection

`ImageInputFileSelection.stories.tsx` mounts two independent SDK-built renderers.
Its stories are tagged `!test`, so the Vitest run skips them and the native
Chromium tests below exercise them instead. These tests wait for a browser
`filechooser` event after trusted pointer, Enter and Space activation on both
selection buttons. A worker `input.click()` on a file input asks the host to
open the chooser. The host opens it with `showPicker()`, so the worker click is
the only click the input receives, once per trusted click inside the same
renderer, within one second of that click and while the browser still has
transient user activation. Synthetic events and clicks in another renderer do
not count.

Selected files cross the existing event transport as native `File` objects,
including metadata, `text()` and `arrayBuffer()` contents, and `ImageInput`
passes them to `onFileSelect`. Reset clears both the native selection and the
worker input's File references without invalidating a File retained by the
callback, so the same file can be selected again. The tests cover disabled and
uploading controls, empty chooser results, callback replacement, renderer
isolation and teardown. Empty results are supplied through Playwright's
intercepted chooser; operating-system dialog dismissal and other browser engines
are not covered by these tests.

A worker-created object URL assigned to `img.src` carries its `Blob` to the host.
Each mounted image owns a host URL and revokes it on source replacement or
unmount. As in browsers, revoking the worker URL keeps an image that already
uses it and only stops later assignments, so revoking once the image has loaded
is safe. Applications own validation, uploads, progress, cancellation and their
worker URLs. Other object URL consumers are outside this adapter's scope.

To run these tests, serve the built Storybook on port 6008 or set
`STORYBOOK_URL`, then run from the repository root:

```sh
npx nx run twenty-front-component-renderer:storybook:test:file-selection
```

The renderer Storybook CI job runs this uncached target after the gallery
checks. `userEvent.upload` in the gallery story checks selection handling and
does not prove native chooser activation.

## Dialog policy

Direct app-owned `Dialog`/`AlertDialog` modality and native browser dialog/popover activation are prohibited in front components. Their standalone Twenty UI APIs have dedicated unit and browser stories. Front components use SDK `openCommandConfirmationModal`, whose structured title, subtitle and confirm-button options are rendered by the host. The Dialog fixture checks the confirmation request. Result handling and actual host modal focus, restoration, dismissal and teardown acceptance remain part of the renderer integration work. No direct Dialog or AlertDialog gallery fixture is retained as a compatibility target.

## Scrolling inside controls

Worker `scrollTop`/`scrollLeft` writes, `scrollTo()`/`scroll()` and
`scrollIntoView()` travel to the host as ordered commands on the owning element.
The host applies them after the commit that carries them, so input selection
changes from the same render land first, and acknowledges the resulting
positions. Reads return the requested value until that acknowledgement or a
newer geometry snapshot arrives. `scrollIntoView()` is reimplemented on the
host: it only moves scroll containers rendered by the same renderer and stops at
the renderer root or its portal layer, so widget frames, the page and other
renderers never move. `html`, `body` and `window` scrolling stays in the worker.

`TwentyUiScrolling.stories.tsx` checks, in React and Preact, Autocomplete
keyboard highlight reveal in a portaled popup and in an inline list nested in an
owned scroller, the filtered-list scroll reset, long LTR and RTL input Home/End
with synthetic and trusted keys, Select selected-option reveal and keyboard
navigation, Select trigger alignment stability, and overflowing Tabs in both
directions. `ScrollCommands.stories.tsx` drives the raw commands: nested and
RTL reveal, read-after-write, echo elision, keyboard scroll without event echo,
no replay after detaching and reattaching a node, portal scroll refresh after
the geometry tracker idles, page scrolling staying local, and two independent
renderers.

Dropdown and the pickers built on it reveal their items through native host
`focus()`, unchanged by these commands. The Autocomplete filter reset needs the
list to have been measured once; it is enrolled when a keyboard reveal scrolls
it, so a query typed within the same frame as that reveal can miss the reset.
Base UI list items re-run navigation from forwarded focus events, so several
arrow keys pressed before the host focus round trip completes can make focus
cycle between options; the Select stories press one key at a time. Select's
initial focus differs between runtimes, so its keyboard steps start from `End`.
Elements created with `document.createElement` for a standard tag name do not
forward property updates made after insertion, so scroll commands on them never
reach the host; elements rendered through JSX do.

## Known sandbox limitations

An invisible popup is not a compatibility pass.

Tabs geometry passes in both React and Preact with the C05 measurement
adapter. The fixture verifies that the Indicator is visible and aligns with
the active tab initially and after selection. The first forward selection
reports the physical activation direction `right`. Selection, callback
values/reasons, focus, panel relationships and native composition also pass.

Native anchor Enter activation also remains a separate renderer limitation.
Base UI recognizes native links by `tagName === 'A'`, while worker refs retain
the remote element name `HTML-A`. It therefore synthesizes a click in addition
to the host anchor's native click. The route fixture preserves exact pointer
counts, pins the observed duplicate Enter callback, and keeps the expected
single Enter callback as a known-failure assertion. Pointer activation, native
link attributes, refs, `aria-current`, and disabled callback suppression pass;
single keyboard activation remains pending renderer integration. Local
fragment links use `target="_self"` to keep navigation inside the story iframe.

SettingsRow's flat Switch props target the control. Its controlled composition
uses `nativeButton` and an actual button through `render`, preserving one change
callback for label and control activation. `labelRender` supplies native label
attributes and handlers, and `labelRef` targets that label. Default span-based
rows still cover label activation, uncontrolled state, read-only and disabled
behavior. Directly
clicking a span control inside its label can produce duplicate change callbacks
because worker cancellation cannot stop the host label's default activation in
time. Native validation attributes such as `required` are currently filtered by
the renderer; standalone UI stories verify that form contract.

These are compatibility regression stories, not assertions that the components
work fully in the sandbox. Scenarios pin the current behavior exactly: a
scenario that reaches a gap asserts what the component reports, and one that
raises errors requires those specific errors and rejects unrelated ones. A fix
must change the corresponding story to assert successful behavior; do not keep
or broaden an obsolete expectation. No stories are skipped or marked as
expected-to-fail by the runner.

| Component                                                             | Current limitation                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Popover, Select (React and Preact) | Body portal content reaches the host inside the component portal area. These fixtures cover opening and visible content; search, selection, dismissal and focus restoration are not covered yet.                                                                                                                                                                                                                                                                                     |
| CountrySelect (React and Preact)                                       | Fixtures pass pointer opening, filtering, disabled interaction, translated labels and decorative flags, controlled/uncontrolled shorthand and compound selection, null clearing/reselection, canceled changes, external values, trigger and option-group render/ref targets, and search input props/ref. Search keyboard activation and IME (API-34), page sessions (API-35), and full portal, geometry, scrolling, outside dismissal and focus restoration acceptance (C04-C07) remain open. |
| PhoneCountryPicker (React and Preact)                             | React interactions and React/Preact trigger cases pass, covering shorthand/compound selection, cancellation, controlled clearing, native refs/render and RTL calling codes. Strict Preact interaction remains failing: typing `"+966"` yields `"966"`, before the clear/replacement assertions run. The input propagation gap remains visible in the active fixture.                                                                                        |
| Slider (React)                                                        | Edge-aligned thumbs stay hidden until the value changes. Base UI 1.8 and 1.9 set up the thumb's `ResizeObserver` before React attaches the `Slider.Control` ref, so the thumb never re-measures once the first host geometry arrives ([mui/base-ui#5995](https://github.com/mui/base-ui/issues/5995), fix pending in [mui/base-ui#6000](https://github.com/mui/base-ui/pull/6000)). Preact attaches the ref first, so its thumbs appear. `thumbAlignment="center"` avoids the issue. |
| OverflowingList                                                       | Item widths come from the last host layout, because a worker cannot lay out the measuring state synchronously. The truncated last item is measured at its truncated width, so the visible count can differ from a native render when that item's full width decides whether it fits.                                                                                                                                                                                                 |
| Responsive hooks                                                      | The sandbox `window.matchMedia` answers for the widget's own box, so `useIsMobile` follows the widget width rather than the browser viewport: a widget 768px wide or narrower gets the mobile layout, and Button drops its hotkey hint, on any screen. `useIsTouchDevice` follows the primary input of the host device, so it is `false` under the desktop Chromium that runs these stories. The fixture asserts both at a 1024px and a 400px widget width.                          |

The CurrencyPicker fixtures cover shorthand and composed selection in React and
Preact, disabled controls and options, exact no-results/name/symbol search,
callback details and trigger refs, null clearing, external updates, dismissal
and focus restoration. These cases do not establish integrated V1 acceptance.

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
activation and disabled items in both runtimes. The Tabs fixture also verifies
manual focus versus activation, uncontrolled automatic activation, canceled
changes, disabled skipping, vertical and RTL navigation, looping boundaries,
panel labeling and mounted-panel hiding, native/render composition and actual
refs. Default panel IDs preserve automatic tab/panel relationships. Base UI 1.8
registers a generated panel ID even when an explicit `id` is supplied, so the
controlled fixture pairs its explicit panel IDs with matching native
`aria-controls` on each tab. Its TabButton controls retain route links with
`aria-current` and adjacent button actions without tab-panel semantics.

A trusted primary press on a slider control, the innermost pressed element that disables touch gestures with `touch-action: none` and contains an enabled range input, starts a host capture session that forwards every move, release and cancellation of that pointer to the worker until the gesture ends, including a release that arrives before the worker answers, a zero pointer id and movement after capture loss. It forwards pointer coordinates and modifiers without another host target's control values, reports the implicit capture release that follows a release or cancellation, and renderer or node teardown ends the session. Each pointer has its own session, so a second pointer on the same control keeps the first capture. Capture only flows from the host to the worker. The worker's `setPointerCapture`, `hasPointerCapture` and `releasePointerCapture` keep a local record of one capturing element per pointer, which a forwarded capture loss or implicit release clears and which a detached element no longer reports. A worker release therefore never ends the host's capture early. General outside presses and overlay dismissal remain separate compatibility work.

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

For real mouse gestures, collision and anchor motion, and independent OverflowingList renderer cleanup, serve the fresh static Storybook on port 6008 and run the suite that CI runs as `storybook:test:layout`:

```sh
npx playwright test --config playwright.layout.config.ts
```

Set `STORYBOOK_URL` to use another Storybook URL. These Chromium tests operate the actual host controls and browser pointer capture; unit mocks do not replace them. Slider's upstream touch cancellation behavior remains a separate API acceptance issue: a native `pointercancel` currently leaves its dragging state active outside the renderer as well. The React Slider gestures are marked as expected failures until Base UI fixes the hidden edge-aligned thumbs described in the Slider limitation above.

The AvatarGroup, Autocomplete, CountrySelect, reading-directions and scrolling fixtures
live in their own story files, so run them separately:

```sh
npx vitest run --config vitest.storybook.config.ts TwentyUiAutocomplete.stories.tsx
npx vitest run --config vitest.storybook.config.ts TwentyUiCountrySelect.stories.tsx
npx vitest run --config vitest.storybook.config.ts TwentyUiReadingDirections.stories.tsx
npx vitest run --config vitest.storybook.config.ts TwentyUiAvatarGroup.stories.tsx
npx vitest run --config vitest.storybook.config.ts TwentyUiScrolling.stories.tsx
npx vitest run --config vitest.storybook.config.ts ScrollCommands.stories.tsx
```

Section and CommandBlock composition is checked in the Typography and DataDisplay
catalogs for React and Preact. The checks cover node titles/actions, heading
levels, description line limits and optional focus, code semantics, native
handlers, refs, and element/callback render composition. Description popup
visibility and dismissal in the sandbox remain part of the existing portal and
geometry acceptance work; standalone Section stories verify those behaviors.

Chip controls check caller-owned empty, fallback and node content, stable default
elements with native handlers, named icon-only buttons, explicit native button
and link composition, DOM refs, keyboard activation and disabled owners in both
runtimes. The same fixtures check intentional link content without automatic
anchors, truncation and custom multiline tooltip content. Escape dismissal is
checked from an explicit button owner with a native keyboard handler, which
relays the event to the worker. General document-listener forwarding remains
part of the renderer's dismissal work.
