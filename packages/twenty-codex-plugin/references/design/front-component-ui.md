# When to Use

Use this when the user wants to design or polish a Twenty front component UI.

Examples:

- Make a front component look better.
- Create a clean layout for a front component.
- Improve loading, empty, error, or disabled states.
- Make a front component responsive and easier to scan.

# Boundaries

Do not scaffold a new app here. Use `create-app` first when the app does not exist.

Do not use this reference for source files, registration, runtime imports, data access, CLI commands, or browser verification.

# Design Rules

Design front components as compact CRM product UI, not marketing pages. The goal is a surface that scans quickly, feels native inside Twenty, and keeps actions predictable.

Use Figma measurements as evidence for the current Twenty rhythm, not as implementation literals. Source code should use Twenty primitives, component props, and `themeCssVariables` instead of hardcoded visual values.

## Twenty UI Defaults

Prefer Twenty UI primitives for CRM-native front component UI:

- Use `H2Title` or `H3Title` for compact section headings.
- Use `Callout` with a matching icon for loading, empty, error, and blocked states.
- Use `Button` for primary and secondary actions.
- Use `Tag`, `Status`, `Chip`, `Label`, and `Avatar` for metadata, state, people, and small summaries.
- Use `themeCssVariables` for spacing, colors, border radius, typography, borders, icon sizing, shadows, and backgrounds.

Use local inline styles for layout containers and custom data displays, but keep them aligned with Twenty tokens. Use `front-components.md` for exact imports and runtime rules.

Use Twenty UI icons before custom SVG. Use `themeCssVariables.icon.size.md` for default row and action icons, `themeCssVariables.icon.size.sm` for quiet chevrons, and `themeCssVariables.spacing[6]` for icon-only action targets.

## Token-First Implementation

When turning a Figma observation into code, translate the visual target into a token:

- Typography uses `themeCssVariables.font.size.*`, `themeCssVariables.font.weight.*`, and `themeCssVariables.text.lineHeight.*`.
- Spacing uses `themeCssVariables.spacing[...]` and `themeCssVariables.betweenSiblingsGap`.
- Radius uses `themeCssVariables.border.radius.sm` for compact controls and `themeCssVariables.border.radius.md` for cards or panels.
- Colors use `themeCssVariables.font.color.*`, `themeCssVariables.background.*`, `themeCssVariables.border.color.*`, or component props.
- Icons use `themeCssVariables.icon.size.*` or native Twenty UI icon sizing.
- Borders use `themeCssVariables.border.color.*`; avoid raw border colors.
- Shadows use `themeCssVariables.boxShadow.*`; avoid custom shadow stacks unless mirroring an existing Twenty overlay exactly.

Do not create source constants named after raw visual measurements. Use semantic names that point to tokens:

```tsx
const compactControlHeight = themeCssVariables.spacing[6];
const denseRowHeight = themeCssVariables.spacing[8];
const panelRadius = themeCssVariables.border.radius.md;
```

Avoid source constants named after raw measurements, such as `rowHeight` or `cardRadius`, when they hide a token choice. Prefer semantic names like `denseRowHeight` and `panelRadius`.

## Base Scale

Use the same small scale across the whole component:

- Body text: `themeCssVariables.font.size.md`, regular weight, medium line height.
- Section titles and row titles: `themeCssVariables.font.size.md`, medium weight, medium line height.
- Descriptions and helper text: `themeCssVariables.font.size.sm`, regular weight, medium line height.
- Metadata labels and table headers: medium body text with `themeCssVariables.font.color.tertiary`.
- Compact controls: use Twenty `Button` sizing or `themeCssVariables.spacing[6]` for custom control height.
- Navigation and menu rows: use the native component when available; otherwise use the nearest theme spacing token that matches the host row rhythm.
- Dense table, list, and input-like rows: use `themeCssVariables.spacing[8]` for custom row height.
- Toolbars and view bars: use `themeCssVariables.spacing[10]` for custom toolbar height.

Do not increase type size to create hierarchy inside compact widgets. Use weight, color, alignment, spacing, and order first.

Applied example:

```tsx
const titleStyle = {
  fontSize: themeCssVariables.font.size.md,
  fontWeight: themeCssVariables.font.weight.medium,
  lineHeight: themeCssVariables.text.lineHeight.md,
  letterSpacing: 0,
  color: themeCssVariables.font.color.primary,
};

const descriptionStyle = {
  fontSize: themeCssVariables.font.size.sm,
  fontWeight: themeCssVariables.font.weight.regular,
  lineHeight: themeCssVariables.text.lineHeight.md,
  letterSpacing: 0,
  color: themeCssVariables.font.color.secondary,
};
```

## Radius And Shape

Use a small, consistent radius system:

- Cards, popovers, notification containers, and framed panels use `themeCssVariables.border.radius.md`.
- Buttons, chips, toolbar controls, menu hover fills, skeletons, and small fields use `themeCssVariables.border.radius.sm`.
- Checkbox shape and target sizing should come from the native Twenty checkbox pattern when available.
- Do not use pill or rounded radius for cards, rows, or toolbar buttons unless the existing Twenty primitive already does.
- Do not mix several custom radii in one component. Pick the matching Twenty radius token for each element role.

Applied example:

```tsx
const cardStyle = {
  borderRadius: themeCssVariables.border.radius.md,
  padding: themeCssVariables.spacing[2],
  background: themeCssVariables.background.primary,
};

const toolbarButtonStyle = {
  minHeight: themeCssVariables.spacing[6],
  padding: `0 ${themeCssVariables.spacing[2]}`,
  borderRadius: themeCssVariables.border.radius.sm,
};
```

## Spacing

Use the theme spacing scale instead of raw dimensions:

- `themeCssVariables.betweenSiblingsGap`: tightly grouped toolbar actions or small separators.
- `themeCssVariables.spacing[1]`: icon-to-label gaps, chip internals, compact row gaps.
- `themeCssVariables.spacing[2]`: default card padding, row horizontal padding, toolbar padding, title-row gaps.
- `themeCssVariables.spacing[4]`: section gaps inside larger panels or between unrelated groups.
- `themeCssVariables.spacing[6]`: left indentation for description text that belongs to a row with a leading icon and label.

Do not jump to large padding inside ordinary CRM controls. If a compact widget starts needing generous whitespace, the layout probably needs fewer sections or better grouping.

Applied example:

```tsx
const titleRowStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: themeCssVariables.spacing[2],
  minHeight: themeCssVariables.spacing[6],
};

const descriptionRowStyle = {
  paddingLeft: themeCssVariables.spacing[6],
  paddingBottom: themeCssVariables.spacing[2],
};
```

## Information Hierarchy

Make hierarchy visible without making the component loud:

- Put the record, object, or task name first. Use medium body text with primary color.
- Put the explanation second. Use small regular text with secondary color.
- Put metadata third. Use `Tag`, `Status`, `Chip`, `Label`, `Avatar`, or tertiary text.
- Put counters and quiet totals in light text, not primary text.
- Use one primary action per small surface. Put secondary actions beside it or behind a menu.
- Use color for state and meaning, not decoration.
- Keep descriptions aligned under the title text, not under the leading icon.
- In a card with a leading icon, use a medium icon, a standard spacing gap, then text. The description starts at the same x-position as the title text.
- In a list or table, reserve the left edge for the most important identifier and keep it stable across every row.

Good hierarchy:

```tsx
<div style={{ display: 'grid', gap: themeCssVariables.spacing[1] }}>
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: themeCssVariables.spacing[2],
    }}
  >
    <Avatar name={ownerName} />
    <span style={titleStyle}>{companyName}</span>
    <Status color="green" text="Active" />
  </div>
  <span style={descriptionStyle}>Renewal due in 12 days</span>
</div>
```

Avoid hierarchy that relies on oversized type, all caps, bright backgrounds, or extra padding. That breaks the compact CRM rhythm and makes dense data harder to scan.

## Alignment

Twenty UI looks precise because repeated edges line up:

- Align every custom surface to the theme spacing grid.
- Use `themeCssVariables.spacing[2]` horizontal padding for compact rows and cards.
- Use `themeCssVariables.spacing[6]` for icon-only action targets so icons share a stable center.
- Align row icons, avatars, labels, and actions vertically center.
- Keep list text left-aligned. Do not center-align row content.
- Keep toolbar context on the left and actions on the right.
- Keep repeated rows the same x-position, width, height, and action position.
- In menus, use a small inset from the menu edge and keep rows full width inside that inset.
- In tables, use the table theme tokens when available, especially `themeCssVariables.table.horizontalCellPadding`.
- Do not let a long value push action buttons out of alignment. Truncate text before actions move.

Toolbar pattern:

```tsx
const toolbarStyle = {
  minHeight: themeCssVariables.spacing[10],
  padding: themeCssVariables.spacing[2],
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: themeCssVariables.spacing[2],
};

const toolbarActionsStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: themeCssVariables.betweenSiblingsGap,
};
```

Table/list row pattern:

```tsx
const rowStyle = {
  minHeight: themeCssVariables.spacing[8],
  padding: `0 ${themeCssVariables.table.horizontalCellPadding}`,
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  columnGap: themeCssVariables.spacing[2],
};

const cellLabelStyle = {
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};
```

## Consistency

Keep visual decisions repeatable:

- Use the same row height token for every row in the same list.
- Use the same action placement in loading, empty, error, and ready states.
- Use the same radius token for the same kind of element everywhere in the component.
- Use the same icon size token for the same role.
- Use the same label for the same action everywhere. Do not mix "Open", "View", and "See record" for one action.
- Use the same empty-state structure across related components: icon, short title, one sentence, one action.
- Use the same loading skeleton geometry as the final content. Do not replace compact rows with centered spinners unless the whole panel is blocked.
- Use Twenty tokens for color and spacing. Use raw values only for semantic data visualization that cannot be represented by existing tokens.

State backgrounds should follow the existing Twenty pattern:

- Default: transparent or `themeCssVariables.background.primary`.
- Hover: `themeCssVariables.background.transparent.light` or `themeCssVariables.background.secondary`.
- Pressed/clicked: `themeCssVariables.background.tertiary`.
- Selected: same shape and height as the default row, with selected color treatment from the nearest Twenty primitive.
- Disabled: same layout, lower contrast, no new decorative color.
- Loading: same dimensions as ready content, with skeleton blocks using the compact radius token.

## Cards And Panels

Use cards only for individual repeated items, notifications, popovers, or genuinely framed tools. Do not put cards inside cards.

Card defaults:

- Radius: `themeCssVariables.border.radius.md`.
- Padding: `themeCssVariables.spacing[2]` for compact cards.
- Title-to-body gap: `themeCssVariables.spacing[2]` only when the body is visually separate.
- Divider: `themeCssVariables.border.color.light` when sections need separation.
- Shadow: prefer `themeCssVariables.boxShadow.light` or the native host surface treatment. Do not combine a strong border with a strong shadow.

Overlay feedback pattern:

```tsx
const overlayFeedbackStyle = {
  borderRadius: themeCssVariables.border.radius.md,
  padding: `${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[1]}`,
  display: 'flex',
  flexDirection: 'column',
  gap: themeCssVariables.spacing[1],
  background: themeCssVariables.background.overlayPrimary,
  backdropFilter: `blur(${themeCssVariables.blur.medium})`,
  boxShadow: themeCssVariables.boxShadow.strong,
};
```

Use overlay styling for small feedback surfaces only. Normal embedded widgets should usually use the host background, a subtle border, or no frame.

## Buttons And Actions

Use actions that feel like Twenty toolbar controls:

- Use `Button` for actual commands.
- Use Twenty button `size` and `variant` props before custom button styling.
- For custom compact controls, use `themeCssVariables.spacing[6]` as the control height token.
- Use `themeCssVariables.spacing[2]` for horizontal padding.
- Use `themeCssVariables.spacing[1]` for icon-label gaps.
- Use `themeCssVariables.border.radius.sm` for custom compact action radius.
- Use medium body text for labels.
- Use medium icons for primary actions and small icons for quiet chevrons.
- Use `themeCssVariables.spacing[6]` for icon-only action targets.

Applied example:

```tsx
<div
  style={{
    display: 'flex',
    alignItems: 'center',
    gap: themeCssVariables.betweenSiblingsGap,
  }}
>
  <Button variant="secondary" size="small" title="Open record" />
  <Button variant="secondary" size="small" title="Add note" />
</div>
```

## Tables And Dense Lists

Use table-like rhythm for CRM data:

- Header and row height: use `themeCssVariables.spacing[8]` for custom dense rows.
- Header text: medium body text with tertiary color.
- Cell text: regular body text with primary or secondary color.
- Cell padding: use `themeCssVariables.table.horizontalCellPadding`.
- Icon-label gap: use `themeCssVariables.spacing[1]`.
- Checkbox column: use `themeCssVariables.table.checkboxColumnWidth` when building table-like custom rows.
- First data column: make it the flexible `minmax(0, 1fr)` column so names get priority and actions stay aligned.
- Truncate long names with ellipsis. Do not wrap names in dense rows unless the row is intentionally two-line.

Applied example:

```tsx
const headerCellStyle = {
  minHeight: themeCssVariables.spacing[8],
  padding: `0 ${themeCssVariables.table.horizontalCellPadding}`,
  display: 'flex',
  alignItems: 'center',
  gap: themeCssVariables.spacing[1],
  fontSize: themeCssVariables.font.size.md,
  fontWeight: themeCssVariables.font.weight.medium,
  color: themeCssVariables.font.color.tertiary,
};
```

## Empty, Loading, Error, Disabled, Success

Design the visible states before polishing the ready state:

- Loading: preserve final layout dimensions with skeletons that use the same row, text, and radius tokens as the ready content.
- Empty: use `Callout` or a compact empty block with one short title, one sentence, and one clear action.
- Error: use `Callout` with an error icon, explain what failed, and offer retry or recovery.
- Disabled: keep the same control size and placement. Lower contrast and explain the blocking condition if it is not obvious.
- Success: use a small status, toast-style card, or inline confirmation. Do not redesign the whole panel for success.

Loading example:

```tsx
const skeletonStyle = {
  height: themeCssVariables.spacing[4],
  width: '60%',
  borderRadius: themeCssVariables.border.radius.sm,
  background: themeCssVariables.background.transparent.light,
};
```

Empty example:

```tsx
<Callout
  variant="secondary"
  title="No activity yet"
  description="Activity will appear here once this record has timeline events."
/>
```

## Text And Copy

Make text fit in real Twenty widths:

- Use sentence case.
- Use short labels.
- Use short button text.
- Use one-sentence descriptions.
- Put dynamic values in stable containers with ellipsis.
- Never let a record name, email, URL, or amount overlap an action.
- Prefer exact object names over generic labels. Use "Open company", not "Open item", when the object is known.
- Keep units and counts close to the value: `12 opportunities`, `$4,200`, `3 tasks`.

Text truncation pattern:

```tsx
const truncateStyle = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
};
```

## Responsive Rules

Front components often render in narrow widgets:

- Design compact widths first.
- Use a single column by default.
- Move secondary actions into a menu before wrapping the whole toolbar.
- Keep the primary action visible when space is tight.
- Let content columns shrink with `minmax(0, 1fr)`.
- Use ellipsis for long identifiers instead of horizontal scroll in small widgets.
- Do not use hero-scale text, marketing sections, or wide decorative imagery in embedded CRM widgets.

Narrow layout pattern:

```tsx
const compactGridStyle = {
  display: 'grid',
  gridTemplateColumns: 'minmax(0, 1fr) auto',
  alignItems: 'center',
  gap: themeCssVariables.spacing[2],
};
```

## Quick Checks

Before considering a UI done, check this list:

- The component uses Twenty typography tokens, not custom text sizes.
- Cards use the medium radius token or a smaller existing primitive radius.
- Buttons and action controls use Twenty `Button` props or compact spacing tokens.
- Table/list rows use a consistent row-height token.
- Icons use `themeCssVariables.icon.size.*` or native Twenty icon sizing.
- Spacing uses `themeCssVariables.spacing[...]` and `themeCssVariables.betweenSiblingsGap`.
- Ready, loading, empty, error, and disabled states share the same structure.
- Important text has a stable left edge and truncates before it overlaps actions.
- Repeated rows have identical height, padding, icon size, action placement, and state behavior.
- The UI uses Twenty primitives and `themeCssVariables` before custom styling.

# Workflow

First, identify the target front component file and the user workflow it supports.

Design the visible states the user will naturally encounter: loading, empty, error, disabled, success, and the primary working state.

Then apply the rules in this order:

1. Set the information hierarchy: title, description, metadata, actions.
2. Lock the structural dimensions with Twenty primitives and `themeCssVariables`.
3. Align repeated edges and action positions.
4. Apply Twenty primitives and tokens.
5. Add hover, pressed, selected, loading, disabled, empty, error, and success states.
6. Test with long names, empty values, narrow widths, and multiple records.
