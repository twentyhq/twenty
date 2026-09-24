# Layout

Use this reference for Twenty app views, navigation, page layouts, page layout tabs, front component registration, and settings menu items. Use `standalone-pages.md` when a page layout is meant to host a full-page custom UI.

## Views And Navigation

Views and navigation define the first-run experience. Add only the surfaces users need to understand and operate the app.

When changing views:

- Put the most common workflow first.
- Use concise names that match the data model.
- Keep list, board, and detail surfaces consistent with existing Twenty patterns.
- Avoid creating navigation entries for low-frequency admin tasks unless users need repeated access.

## Page Layouts

Page layouts should make the record's current state and next action easy to scan.

When adding layouts or tabs:

- Group related fields and components.
- Keep important record status visible without scrolling when possible.
- Place front components where they support the surrounding record context.
- Include empty and loading behavior for front components shown on record pages.

## Front Component Widgets

When adding an app-defined front component to a record page layout, use the component's universal identifier in the widget configuration:

```ts
{
  universalIdentifier: '<widget-uuid>',
  title: '<Widget title>',
  type: 'FRONT_COMPONENT',
  objectUniversalIdentifier: '<object-uuid>',
  configuration: {
    configurationType: 'FRONT_COMPONENT',
    frontComponentUniversalIdentifier: '<front-component-uuid>',
  },
}
```

Use `frontComponentUniversalIdentifier` for app-defined front components. A `frontComponentId` is not the same value and will not link the widget to the app component correctly.

## Settings Menu Items

To add an entry to an app's settings menu, declare it with `defineSettingsMenuItem` and point it at the front component that renders it:

```ts
{
  universalIdentifier: '<settings-menu-item-uuid>',
  frontComponentUniversalIdentifier: '<front-component-uuid>',
  title: '<Item title>',
  icon: '<IconName>',
  position: 1,
  scope: 'WORKSPACE',
}
```

The menu item points at the component, not the reverse, so one component can back several items. Declare as many as the app needs. Each renders as a tab on the app's page under Settings > Apps, after the built-in General tab, in `position` order.

`scope` is `WORKSPACE` (configured once for the whole workspace, the default) or `USER` (configured by each member for themselves). Only `WORKSPACE` items render today — a `USER` item is persisted and synced but nothing displays it until its placement under the member's own settings lands, so say so rather than declaring one for a settings entry an app needs visible now. Note that application variables are workspace-wide, so a `USER` item storing something per person must persist it through the app's own objects.

Items sort by ascending `position`, which is a decimal so an item can be slotted between two existing ones. Two items of one app cannot share a position in the same scope, and `General` is reserved for the built-in item.

## Verification

Run the app and inspect the user path from navigation to view to record detail. The route should be discoverable without relying on implementation knowledge.

For front component implementation and runtime verification after placement, use `front-components.md`.
