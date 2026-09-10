# Twenty UI renderer coverage

`TwentyUiGallery.stories.tsx` covers the original component catalog.
`TwentyUiMigrations.stories.tsx` backfills components added or migrated by
PRs #24277, #24278, #24279, #25584, #25596, #25607, #25610, #25612,
#25625, #25663, #25665, and #25678. Each fixture has React and Preact stories.

| Fixture | Components |
| --- | --- |
| `twenty-ui-field-controls` | Field, Input, InputGroup, Textarea, InputLabel, InputHint |
| `twenty-ui-display-helpers` | Text, EllipsisDisplay, NumberDisplay, JsonDisplay, TextDisplay, SelectDisplay |
| `twenty-ui-list-item` | ListItem |
| `twenty-ui-tabs` | Tabs |
| `twenty-ui-popover` | Popover |
| `twenty-ui-menu` | Menu |
| `twenty-ui-select` | Select |
| `twenty-ui-toast` | Toast |
| `twenty-ui-alert-dialog` | AlertDialog |
| `twenty-ui-switch` | Switch (interaction coverage in addition to the original input gallery) |

Fixtures import the public twenty-ui entry points and `twenty-ui/style.css`.
The story builder resolves that stylesheet to the individual build's CSS so
class names match the JavaScript used by the sandbox. Importing CSS in the
fixture also exercises the SDK's CSS injection and the renderer's style bridge.

## Known sandbox limitations

These are compatibility regression stories, not assertions that the components
work fully in the sandbox. The failing scenarios require specific errors and reject unrelated errors,
following the existing gallery convention. Known precursor errors are optional
because the host can coalesce worker errors into a single state update. A fix
must change the corresponding
story to assert successful behavior; do not keep or broaden an obsolete error
expectation. No stories are skipped or marked as expected-to-fail by the runner.

| Component | Current limitation |
| --- | --- |
| Field controls | Forwarded events lack the native event used for `composedPath`. React serializes boolean `aria-invalid` as an empty string; Textarea's cloned render element loses its change handler in React. The value report checks the state received by the component after typing. |
| Tabs | React cannot mount without `compareDocumentPosition`; Preact activation fails on the missing native event for `composedPath`. |
| Popover, AlertDialog | Opening fails while reading unavailable viewport width data. |
| Menu, Select | Opening fails on viewport data and/or missing `nativeEvent.pointerType`. |
| Switch | Activation attempts to construct an unavailable `PointerEvent`. |

Once those gaps are fixed, extend the stories to verify selection, disabled
items, keyboard navigation, and overlay content, dismissal, and focus restoration.
The fixtures already include the controlled state, compound parts, and callback
output for those checks. Passing display, ListItem, and Toast stories verify
rendering/CSS or interaction behavior directly.

## Run

From the repository root, build the fixture dependencies and sandbox with
`npx nx run twenty-front-component-renderer:storybook:prebuild`.
Then, from `packages/twenty-front-component-renderer`, run:

```sh
npx vitest run --config vitest.storybook.config.ts TwentyUiMigrations.stories.tsx
```
