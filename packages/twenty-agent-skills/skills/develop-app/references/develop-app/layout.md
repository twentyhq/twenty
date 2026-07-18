# Layout

Use this reference for Twenty app views, navigation, page layouts, page layout tabs, and front component registration. Use `standalone-pages.md` when a page layout is meant to host a full-page custom UI.

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

## Verification

Run the app and inspect the user path from navigation to view to record detail. The route should be discoverable without relying on implementation knowledge.

For front component implementation and runtime verification after placement, use `front-components.md`.
