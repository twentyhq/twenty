# When to Use

Use this reference when creating, designing, or polishing a Twenty front component UI, including its layout, controls, responsive behavior, and visible states.

# Boundaries

Do not scaffold a new app here. Use `create-app` first when the app does not exist.

Do not use this reference for source files, registration, runtime imports, data access, CLI commands, or browser verification. Those rules live in `../develop-app/front-components.md`. Use `../develop-app/layout.md` for placement and `../develop-app/standalone-pages.md` for full-page UI.

# Design Rules

Design front components as compact CRM product UI. Reuse Twenty UI controls before creating custom equivalents or adding another component library. Use local layout styles for app-specific structure and data displays.

Keep the essentials below in mind, then read the relevant official component page for its current props and composition:

- [Getting started](https://docs.twenty.com/ui/getting-started): public entry points and library setup. Follow the front component runtime reference for host-provided styling and theme setup.
- [Components](https://docs.twenty.com/ui/components/overview) and [Primitives](https://docs.twenty.com/ui/primitives/overview): find an existing control and its API.
- [Theming](https://docs.twenty.com/ui/theming) and [Tokens](https://docs.twenty.com/ui/tokens): semantic styling and token names.
- [Icons](https://docs.twenty.com/ui/icons): individual icon exports and supported props.

## Twenty UI Defaults

Prefer Twenty UI primitives and shared components for native-looking controls:

- Use `MainButton` for prominent actions and `LightButton` for lightweight actions, from `twenty-ui/components/input`. Use `Button` from `twenty-ui/primitives/input` when the foundational control is sufficient.
- Use `Field`, `Input`, `Select`, `Checkbox`, and other controls from `twenty-ui/primitives/input` for forms. Compose their documented parts rather than recreating labels, selection, and focus behavior.
- Use `Heading` and `Text` from `twenty-ui/primitives/typography`, or `Section.Header` from `twenty-ui/components/layout` for a heading with a description or action.
- Use `Tag`, `Status`, `Chip`, and `Avatar` from `twenty-ui/primitives/data-display` for metadata, state, people, and small summaries.
- Use `Callout` from `twenty-ui/components/feedback` for explanatory loading, empty, error, and blocked states; use a loader or progress primitive when progress alone is enough.
- Use individual icons from `twenty-ui/icon`. Follow Twenty's established icon for the product concept before creating custom SVG.
- Use the host confirmation dialog for confirmation actions. Keep forms inline or in a side panel; follow `../develop-app/front-components.md` for supported overlay APIs.

## Menus And Pickers

Use `Dropdown` from `twenty-ui/components/navigation` for action menus, searchable pickers, and compact form panels. Compose `Dropdown.Root`, `Dropdown.Trigger`, and `Dropdown.Content`; provide a Twenty button through the trigger's `render` prop and give the content an accessible label.

Choose the root's `type` for its interaction:

- `menu`: `Dropdown.ActionItem` for commands and `Dropdown.OptionItem` for selectable settings.
- `picker`: `Dropdown.Search` and `Dropdown.OptionItem`, with application-owned search and selection state. Set `multiple` on the root when selections should keep the picker open.
- `panel`: form controls with normal Tab navigation.

Use `Dropdown.Loading`, `Dropdown.Empty`, sections, and separators before building custom equivalents. Read the [Dropdown documentation](https://docs.twenty.com/ui/components/navigation/dropdown) for nested pages and submenus.

## Semantic Tokens

Use `themeCssVariables` for styles instead of copying visual measurements from a screenshot or Figma. Prefer semantic paths such as `font.color.primary`, `background.secondary`, `border.color.light`, `border.radius.md`, and `spacing[...]` so the UI follows the workspace palette and scale.

Read tokens inside the component body. The style declarations below belong inside render-time code, following `../develop-app/front-components.md`; do not evaluate token-based styles at module scope.

```tsx
import { LightButton } from 'twenty-ui/components/input';
import { Section } from 'twenty-ui/components/layout';
import { themeCssVariables } from 'twenty-ui/theme';

const ActivitySummary = ({ onRefresh }: { onRefresh: () => void }) => {
  const containerStyle = {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: themeCssVariables.spacing[2],
    padding: themeCssVariables.spacing[2],
    background: themeCssVariables.background.secondary,
    color: themeCssVariables.font.color.primary,
    borderRadius: themeCssVariables.border.radius.md,
  };

  return (
    <section style={containerStyle}>
      <Section.Header title="Activity" description="Recent record changes" />
      <LightButton size="sm" onClick={onRefresh}>
        Refresh
      </LightButton>
    </section>
  );
};
```

Every `themeCssVariables` value is a CSS reference string. In front components, `useTheme()` also returns CSS references by default, including for tokens typed as numbers. Use these references in CSS styles, without arithmetic. Use an explicit numeric value when a component prop requires a number, such as an icon's `size`.

Prefer component `size`, `variant`, and color props before overriding their styles. Keep custom spacing, radii, borders, and typography consistent with nearby Twenty UI controls. Avoid adding a heavy card frame or shadow when the host already provides the surface.

## Compact Responsive Layouts

Design for a narrow widget first. Use a single column by default and let data columns shrink with `minmax(0, 1fr)` and `minWidth: 0`. Keep the primary action visible and move secondary actions into a menu when space is tight.

Align repeated rows, labels, icons, and actions. Use consistent row height, padding, and gaps. Truncate long names, emails, and URLs before they overlap an action; preserve access to the full value when it matters.

Use weight, color, spacing, and order for hierarchy before increasing text size. Prefer compact headings and sentence case. Keep units and counts beside their values and use specific action labels such as "Open company".

## Visible States And Accessibility

Design the visible states before polishing the ready state:

- Loading: preserve the content's layout with a loader or skeleton; prevent duplicate submissions while saving.
- Empty: explain what is missing and provide a useful next action when one exists.
- Error: explain what failed and offer retry or recovery.
- Disabled: keep the control's placement and explain a non-obvious blocking condition.
- Success: use a small status or inline confirmation without replacing the whole panel.

Give inputs visible labels with `Field.Label` and associate help and errors through the component's documented composition. Put visible action text in button children; `title` alone does not provide a visible label. Give icon-only actions an `aria-label` and hide decorative icons from assistive technology.

Preserve keyboard navigation, focus handling, and accessible names when composing triggers. Prefer the library's interaction behavior over hand-written clickable containers.

## Quick Checks

Before handing off to the runtime verification in `../develop-app/front-components.md`, check:

- Equivalent Twenty UI controls are reused and their public family entry points are used.
- Tokens and component props provide consistent spacing, typography, colors, and radii in light and dark themes.
- Long values, empty values, narrow widths, and multiple records keep actions reachable.
- Ready, loading, empty, error, disabled, and saving states are understandable.
- Inputs have labels, icon-only actions have accessible names, and keyboard users can reach each action.
