---
version: alpha
name: Twenty
description: Product UI of Twenty, the open-source CRM. A calm, dense, keyboard-first workspace built from twenty-ui components on a 4px grid.
---

# Twenty

How Twenty's product UI looks and behaves. Read it before building or changing any screen in `twenty-front` or `twenty-ui`.

Values live in code: the Display P3 tokens in `packages/twenty-ui/design-tokens`, exposed through `themeCssVariables` as `--t-*` CSS variables. This file cites tokens by their path, such as `font.color.secondary`. Component APIs are documented at [docs.twenty.com/ui](https://docs.twenty.com/ui).

In twenty-front, style with Linaria and `themeCssVariables`; read `useTheme()` only for values a component takes as props, such as an icon's `size` and `stroke`. In twenty-ui, SCSS modules read the same tokens as `var(--t-spacing-2)` and share mixins such as `@include focus-ring`.

```tsx
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRow = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  gap: ${themeCssVariables.spacing[2]};
`;
```

When sources disagree on a value (a size, a color, a prop), code on `main` is right. The usage rules in this file can be ahead of older screens: in new work, follow the rule rather than an older screen that breaks it. Figma comes after both on values, and other products' conventions come last. A Figma frame linked to a task is still that task's target: match its layout, spacing, text styles and every state with tokens, and flag any value no token expresses.

Out of scope: the website, the docs site and marketing visuals. They use other fonts and a different blue.

## Overview

Twenty should feel like one calm, unified workspace, closer to Notion than to Salesforce. Apps contribute objects, fields, commands and widgets to that workspace; they never become separate rooms with their own navigation.

The bar for any new screen is **native**: it looks like it shipped with the product. Native comes from reuse. Build from existing twenty-ui and twenty-front components, copy the **sibling** (the closest screen already doing the same job), and add a new pattern only when no sibling exists.

- Dense but quiet. 13px Inter, neutral grays, one blue accent. Hierarchy comes from weight and gray steps before size or color.
- Keyboard-first. Every action is a command reachable from ⌘K.
- Four **landmarks** stay recognizable: the record index, the record page, settings and standalone pages.
- Light and dark mode are equal; tokens handle both.

## Colors

Pick colors by role, through semantic tokens. Palette steps (`color.blue9`, `color.red3`) are for components that need a hue, such as tags and avatars. In twenty-front, lint (`twenty/no-hardcoded-colors`) rejects hex and rgb colors.

| Role | Token |
|---|---|
| Page and panel surface | `background.primary` |
| Subtle surface, table headers | `background.secondary` |
| App frame behind panes, button hover | `background.tertiary` |
| Row hover | `background.transparent.light` |
| Selected rows | `accent.quaternary` |
| Content text, values | `font.color.primary` |
| Supporting text, menu items, button labels | `font.color.secondary` |
| Metadata, hints, timestamps, group labels | `font.color.tertiary` |
| Placeholders, disabled text, decorative icons | `font.color.light` |
| Dividers | `border.color.light` |
| Card, menu and input outlines | `border.color.medium` |
| Strong lines: workflow edges, shortcut keys | `border.color.strong` |
| Accent: main action, focus | `color.blue` |
| Danger | `color.red`, `font.color.danger` |

- Blue means one of four things: the main action, focus, selection, or a changed value. Hover stays gray. Content sent to customers, such as an email, stays neutral.
- Content text is tertiary or darker. `font.color.light` is reserved for placeholders, disabled text and decorative icons, because it reads as disabled.
- Categories use the tag colors, gray when unsure.
- Danger red is for errors and destructive confirmations; a loss or a decrease stays gray. Green marks completion or what remains, sparingly.

## Typography

Inter everywhere in the product, with a 13px root: `font.size.md` is `1rem` = 13px. DM Mono (`code.font.family`) for code, IDs and logs.

| Use | Primitive | Size | Weight |
|---|---|---|---|
| Titles | `Heading` (`xxl`, `xl`, `lg`), sized like the sibling screen's title | 24px, 20px, 16px | semibold |
| Side panel titles | `Text weight="semibold"` | 13px | semibold |
| Body, values, menu items | `Text` | 13px | regular or medium |
| Secondary lines | `Text size="sm"` | 12px | regular |
| Group and section labels | `Text size="xs"` | 11px | semibold |
| Chat messages | chat components | 13px on 24px lines | regular |

- Use `Heading` and `Text` from `twenty-ui/primitives/typography` instead of setting font sizes by hand.
- Three weights: regular for reading, medium for emphasis and unread items, semibold for titles and labels.
- Put secondary information on the same line, to the right, in a lighter step, before stacking a second line.
- Next to text, use the size the component gives the icon (14px beside body text). Never enlarge an icon to add emphasis.

## Layout

Everything sits on a 4px grid: `spacing[n]` is `n × 4px`. The usual steps are 2px between siblings (`betweenSiblingsGap`), 4, 8, 12, 16, 24 and 32.

- The app frame is `background.tertiary`, with the sidebar (`NavigationDrawer`) on it to the left (48px when collapsed). The page and the side panel are panes on `background.primary`. The page header puts the breadcrumb on the left and commands on the right, with ⌘K at the far right. The side panel opens on the right, defaults to 400px wide and resizes between 320px and 600px (`SIDE_PANEL_CONSTRAINTS`), remembering the user's chosen width.
- Bars that sit side by side share one height: the sidebar header, the page header and the side panel top bar all use `APP_HEADER_HEIGHT` (48px).
- Spacing belongs to the container. Slots carry the padding; a component that fills a slot has none of its own.
- Controls share heights: 32px for inputs, default buttons and menu rows, 24px for small buttons and toolbar icon buttons. Icon-only buttons are square. An edit-in-place input keeps the row at its height.
- Align on one axis: a block is left-aligned or centered, never half of each, and a toggle centers on its label. Opposite paddings match, and tooltips, titles and popups hug their content.
- Align edges across regions: tabs with content, the page header with the side panel header, table headers with their columns.
- Banners come first, at the top of their page or panel.
- Long text truncates with an ellipsis and a tooltip (`OverflowingTextWithTooltip`). Chip lists overflow into a `+N` chip and tab bars into a More tab, so nothing is partly clipped. A row or tab bar never scrolls horizontally, and a container sized to its content never scrolls for a sliver.
- Chat content is centered, at most 768px wide.

## Elevation & Depth

Twenty is mostly flat. Depth comes from surfaces (white panes on the gray frame) and 1px borders.

- Each line has one owner. A header owns its bottom border; each row owns its bottom border except the last. Two borders touching is a bug.
- Cards in a page use an outline, not a shadow.
- Shadows and blur belong to floating layers (dropdowns, popovers, tooltips, dialogs) and ship with their components. Shadows are neutral: no colored shadows, glows or text shadows.

## Shapes

Twenty uses squircles where the browser supports `corner-shape` (Chromium 139+). There the theme doubles the radius tokens, because a squircle needs about twice the radius to read as the same size; other browsers get round corners at the base values.

- Squircle the rectangles: buttons, inputs, menus, cards, panels.
- Keep round things round: avatars, checkboxes, switch handles, chips, tags, pills, dots, spinners. They use `border.radius.smRound`, `mdRound`, `lgRound`, `pill` or `rounded`, which never double.
- Nested radii are concentric in both modes. Derive the inner radius from the outer token minus the inset: `calc(var(--t-border-radius-md) - var(--t-spacing-1))`, as `ListItem` does. Picking a smaller token by eye breaks concentricity under squircles.
- Small framed clusters, 24 to 32px tall (`RecordTableCellButtons`, icon button groups), use `sm` for the frame so the outer radius never clamps.
- Opt a subtree out with `--t-corner-shape: round`.
- All inputs share one radius (`md`) and one focus style: the border turns blue.
- Hover, selection and focus shapes follow the element's own radius.

## Motion

Motion shows what changed. Durations come from `animation.duration`; `fast` and `normal` cover most transitions.

- Animate state changes: a chevron rotates as its section opens, popups and panels open and close, an item entering edit mode fades in while its neighbours slide with it, and a tab bar reflows when a tab is added or removed.
- Keep it fast, subtle and symmetric: closing mirrors opening, in both directions.
- Movement stays calm: no bounce, blink, flash or layout jump, and no animated ellipsis while an AI answer streams.
- Under `prefers-reduced-motion`, transitions turn off, as in `Button` and `Switch`.

## Iconography

Tabler icons, imported from `twenty-ui/icon`. Product concepts (objects, views, layouts, fields) use their canonical icon from [`icon-dictionary.md`](packages/twenty-ui/src/icon/icon-dictionary.md); actions use action icons, statuses use status icons. One concept, one icon: when two concepts share an icon, fix one of them.

- Sizes: 16px by default (`icon.size.md`), 14px in dense rows, table cells and inline metadata, 16px in a table's first column. A lone icon can go up to 20px; repeated icons stay small. Provider and app logos share one optical size.
- Stroke: `icon.stroke.sm` (1.6) for nearly all UI icons.
- Color comes from the container: `font.color.secondary` in buttons and menu items (as in `ListItem`), tertiary for quiet metadata, light in the collapsed navigation. An icon that renders black has lost its token.
- Objects keep their color: `ColoredIcon` (bare, 16px) in the navigation, `TintedIconTile` in menus and lists. Action icons stay monochrome.
- Every item shows its icon: a field its field-type icon, an object its object icon. In a menu, a create or add item shows the icon of what it creates instead of a plus.
- Agents use `AssistantAvatar`, a round avatar colored per agent.
- Recurring glyphs: `IconShare`, `IconMessageCirclePlus` (new chat), `IconZzz` (snooze), `IconCheck` (done), `IconLayoutSidebarRightCollapse` (collapse the side panel), `IconTrash` (remove), `IconDotsVertical` (options), `IconEye` and `IconEyeOff` (can see, can't see).

## Components

Reuse is the first rule. Before writing a styled component, find what the sibling uses.

1. **Copy the sibling.** Use the same component with the same props, size and variant as the control next to it or the screen doing the same job. Model composite patterns (pickers, selects, forms) on a production usage, not on a twenty-ui story. Where the sibling breaks a rule in this file, follow the rule.
2. **Use shared components as they are,** without overriding their styles from a feature. When one lacks something, use its closest existing variant (gray for tags) and flag the gap. Changing a shared component, or adding a prop or variant to a primitive, waits for the design owner's request.
3. **One component per concept.** Variants become properties, look-alike components merge, and a component made for one screen is a fork to avoid.
4. **Verify in the real parent.** Render the change inside its actual page or panel, in light and dark mode and in every state (collapsed sidebar, edit mode, side panel open, empty, loading, long content), and compare icon size, stroke, color and spacing with the neighbours. An isolated story hides mismatches.
5. **Fix the cause, then look for repeats.** Fix a visual bug at its root cause rather than with a local override, and find the other places with the same problem. Fix those within the same feature and list the rest in the PR description. When a shared component does change (rule 2), check every place it reaches.

When no sibling sits next to your work, start from these reference screens:

| Building | Start from |
|---|---|
| A settings list with a create action | `SettingsRolesList` |
| A settings page with cards and actions under them | `SettingsAdminUserDetail` |
| A list inside a page section | `WorkflowAiAgentPermissionsPermissionRow` (`ListItem` rows) |
| A side panel form | `SidePanelRecordUpdateFormPage` |
| A side panel list | `SidePanelSearchRecordsPage` |
| A multi-select picker | `SettingsMorphRelationMultiSelect` |
| An empty state | `EmptyState` |

Pick components by need:

| Need | Use | Instead of |
|---|---|---|
| The main action of a view | `Button color="accent" variant="solid"`, one per view | a second accent button |
| Other actions | `Button` defaults (outline, neutral, `md`) | custom styled buttons |
| Secondary icon-only action in a toolbar or widget header | `LightIconButton` | a bare icon with an onClick |
| Icon button among other controls | the sibling's icon button, same size | mixing button families in one group |
| Destructive action | `Button color="danger"`, outline or ghost | a red filled button |
| Pinned command in a header | `CommandMenuButton`, neutral even for Delete | per-action colors |
| Secondary actions, such as archive and delete | an options menu (`IconDotsVertical`) next to the main button | a row of extra buttons |
| Status of a record or process | `Status` | a `Tag` with an icon |
| Category or select value | `Tag`, gray when unsure | new tag colors or props |
| Count or unread number | `Badge` | ad hoc counters |
| Person or company | `Avatar`, round for people, square for companies | initials in a styled div |
| Reference to a record | `RecordChip` | bold text or a plain "@name" |
| Agent | `AssistantAvatar` | robot or brick icons |
| Menu, picker or compact form panel | `Dropdown` (`type` menu, picker or panel) | a custom popover |
| Menu title | `Dropdown.Header`, or `DropdownMenuHeader` in twenty-front | a section label as the first row |
| Groups inside a menu | `Dropdown.Section` with its quiet label, `Dropdown.Separator` between groups and after `Dropdown.Search` | gray bands |
| One choice from a list, such as an access level | `Select` | a custom dropdown |
| Several choices | `Dropdown type="picker"` with `Dropdown.SelectionGroup multiple` (checkbox rows) and a `MultiSelectControl` trigger | `Select multiple` with check marks |
| Two or three exclusive options in a panel | `SegmentedControl` | a custom toggle group |
| On/off setting | `Switch` in a `SettingsRow` or `SettingsOptionCardContentSwitch` | a custom toggle |
| Form field | `Field` (Label, Description, Error) around `Input`, `Textarea` or `Select`, label on top | a bare input without its border |
| List inside a page section | `ListItem` rows (icon, label, description, hover actions) | bespoke rows |
| List in the side panel or ⌘K | `SidePanelList`, `SidePanelGroup`, `CommandMenuItem` | bespoke rows |
| Settings data | `SettingsTableListSection`, `Card` with `SettingsListItemCardContent` | generic lists |
| Persistent notice | `Callout` or `InlineBanner` | a toast or a modal |
| Transient confirmation | `Toast` | an inline banner |
| Explaining an icon-only control or cut text | `Tooltip` (`content`, plus `description` for an explanation), `OverflowingTextWithTooltip` | a `title` attribute |
| Loading | `Skeleton` in the content's shape with few bars, `Loader` for small waits | content that jumps or flashes on load |
| Section title and description | `Section.Header` | custom heading markup |

## Patterns

### Commands and fields

Classify before placing. A **command** acts (Share, Snooze, Done, Delete); a **field** is data on the object (Status, Assignee, Following). Headers and ⌘K hold commands; the fields bar holds fields. A command that writes a field (Done writes Status) can sit in the header while the field stays in the bar.

- Header buttons are ⌘K commands pinned to the header, and every pinned command also exists in ⌘K. Pinned commands share one look: neutral outline, accent for the main one, Delete included.
- In headers and ⌘K, show only the actions that can run: hide an unavailable action instead of disabling it.

### Command menu

- Every command is a row: icon, label, shortcut chips. Up and down move, Enter runs. A fold opens with → or Enter and closes with ← or Backspace.
- Sections run in this order: pinned, selection, the current object, Ask and find, create record, workspace, go to, and Ask AI as the fallback.
- Every command stays reachable from every page, settings included. Less relevant commands sit lower; none is hidden.
- The right side of a row holds shortcut chips and fold chevrons only. Extra meaning goes on the left, such as an app's logo as a badge on the command icon.
- An installed app's commands sit together in their own section after the standard and custom ones.

### Side panel

The side panel is where secondary work happens: record previews, AI chat outside the Inbox, and every flow that needs input or review.

- It closes through the collapse button left of the breadcrumb (`IconLayoutSidebarRightCollapse`), Esc, or the "Close side panel" command. It has no X button.
- Build its pages from native parts: `HeaderIdentifier` in the header (counts go in its label, as in "25 selected"), `Field` forms, `SegmentedControl` for a two-way choice, `Card` with `SettingsListItemCardContent` for read-only breakdowns, `SidePanelInformationBanner` on top for blocking messages, and `SidePanelFooter` with an outline Cancel and an accent action carrying the `Mod+Enter` shortcut.
- Lists use menu rows, with row actions behind Options. Membership toggles are checkbox rows, split into members and non-members while searching.
- A modal is only for a short yes or no. Anything with content (recipients, settings, a form) is a side panel page, which is also the surface app developers get.

### Menus

- A menu opens with its items, or with a header when it needs a title. The first item is highlighted, so Enter runs it.
- A long menu caps at 176px, five and a half rows, so the cut row shows that it scrolls.
- Arrow keys stay inside the open menu. A menu that adds an item closes once it is added; a multi-select picker stays open.
- Selection follows the component: a check for single choice, a blue checkbox for multiple.

### Settings

- A page is a stack of sections. A section is a `Section.Header` (title and one-line description) followed by a table or a card.
- 16px inside a section, 32px between sections. Add and edit buttons sit under the section body, never in its header: in a row 12px under a card, or in a table's `TableFooter`, next to export. A table comes last on its page.
- A page's tabs sit right under its header, never inside the content. A new setting joins its peers, as an option in the existing menu or a card inside the related card, before it gets a section of its own.
- Tables: first column in primary text, the rest in secondary, with search in the table. An empty table is a single row of tertiary text.
- While loading, the placeholder sits in the breadcrumb; the body gets no skeleton.

### Record pages and tables

- The identifier bar stays separate from the tabs.
- Fields edit in place with a real input. An empty multi-value field shows an open input; a filled one shows an Add row.
- Index tables: gray hover, `accent.quaternary` selection, 14px icons with 16px in the first column, enum values as tags.
- Widgets: the platform owns the chrome. Lists render flush, grids render framed, and padding is the same on every tab. A widget alone in the side panel renders flush and keeps its header only when the header has an action. Canvases such as the workflow editor run full-bleed.

### Forms and editing

- Every input has its own label, even in a repeated list (Option 1, Option 2). Optional fields show inline instead of behind an Add button.
- Row actions reserve their space: an input keeps its width whether its trash shows or not.
- Clicking into an edit-in-place input selects its text, and typing never moves focus.
- A click that selects text or starts a drag never opens a panel. After an action, the user stays on the item they acted on.

### AI chat

- Outside the Inbox, a chat opens in the side panel.
- A message shows avatar, name and time on top, with content aligned to the left edge.
- Tool calls stay out of the answer. They collapse into monochrome thinking steps ("Worked for 12s"), and results surface as chips.
- The response header says who is working ("Ada is thinking"). A pending question or approval replaces the composer until answered.
- Hover actions: copy everywhere; edit and delete on your own messages; reply and react on teammates'; retry and react on the AI's. Messages get no thumbs up or down.
- A new chat shows the agent's avatar, "What can I help you with?" and three outline prompt buttons.

### States

- Hide what has nothing to show or do: an empty section, a More with nothing behind it, a close button on a callout that can't close.
- An affordance appears only with its action: a chevron only on items that open or navigate, a hover state only on what is clickable or editable, select styling only where a dropdown opens.
- In pickers and option lists, an unavailable option stays visible but disabled, after the available ones, with a short reason in its description or tooltip. A control that a mode blocks is disabled, with a tooltip that says why.
- New illustrations match the existing set. Reuse one before drawing one.
- Centered empty placeholders are for lists outside tables; tables show their single tertiary row.

## Copy

- Sentence case, short and specific: "Open company", not "Open". Cut filler: "Create company", not "Create new company"; "Name", not "Result name".
- Use the product's words. Say relation and related, not link or linked. Say can see and can't see, not hidden or visible. Share levels are Can view, Can edit and Full access; relation types are Has many and Belongs to one. One concept keeps one name across the UI and docs: say sidebar, not navigation drawer or navbar. Before inventing a label, search the Lingui catalogs for an existing one. All UI strings go through Lingui.
- Labels say exactly what they act on. Replace vague ones such as "This view", "Action" or "Workspace default".
- Placeholders show a concrete example for the exact case, without "e.g.". Friendly names come first; technical names go in a tooltip.
- Join a name and its qualifier with a middle dot, qualifier in tertiary: "GPT-6 Luna · Medium". Slashes are for breadcrumbs only.
- Show each piece of information once: cut descriptions that repeat the title, second titles, and labels when the choices explain themselves. Limits and fine print go in a tooltip.
- Numbers are compact (128K, 1.2M). Dates follow the member's format setting, and lists show dates without times. Relative dates keep their verb ("Created 2 days ago"). Missing data shows as empty, never "undefined" or a fake 0.
- Stories, screenshots and mockups use neutral data (Acme, the dev seed), never customer names or IDs.

## Do's and Don'ts

- Do take every value from a token. Never copy hex or px values from a screenshot, Figma or this file.
- Do list any new component, prop, variant or pattern in the PR description. Most UI changes add none.
