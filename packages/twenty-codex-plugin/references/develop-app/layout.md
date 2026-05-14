# Layout

Use this reference for Twenty app views, navigation, page layouts, page layout tabs, and front component registration.

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

## Verification

Run the app and inspect the user path from navigation to view to record detail. The route should be discoverable without relying on implementation knowledge.
