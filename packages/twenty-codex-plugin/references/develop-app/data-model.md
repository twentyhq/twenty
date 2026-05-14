# Data Model

Use this reference for Twenty app objects, fields, relations, roles, and permissions.

## Objects And Fields

Objects and fields define the records users will create, view, search, and automate. Model the user's workflow first, then add the smallest set of fields that makes the workflow usable.

When adding or modifying data model entities:

- Prefer generated app entity patterns from `yarn twenty add`.
- Use clear object and field names that map to user-facing language.
- Add relations only when users need to navigate or report across records.
- Avoid duplicating data that already exists on core Twenty objects.
- Keep field types specific enough to support filtering, views, and automation.

## Roles And Permissions

Roles should match operational responsibility, not implementation convenience.

When adding permissions:

- Grant the smallest useful scope.
- Keep sensitive objects and fields out of broad roles.
- Check whether the app introduces side effects through logic functions before granting write access.

## Verification

After data model changes, run the app and verify the objects, fields, and roles appear where the user will manage or use them.
