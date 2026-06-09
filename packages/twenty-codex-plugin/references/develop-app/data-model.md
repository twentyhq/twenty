# Data Model

Use this reference for Twenty app objects, fields, relations, roles, and permissions.

## Objects And Fields

Objects and fields define the records users will create, view, search, and automate. Model the user's workflow first, then add the smallest set of fields that makes the workflow usable.

When adding or modifying data model entities:

- Prefer generated app entity patterns from `yarn twenty dev:add`.
- Use clear object and field names that map to user-facing language.
- Add relations only when users need to navigate or report across records.
- Avoid duplicating data that already exists on core Twenty objects.
- Keep field types specific enough to support filtering, views, and automation.

### Usable Object Pattern

When the user asks for a new object and does not explicitly restrict the request to schema only, make the object usable in the app by pairing data model work with the minimum layout/navigation surfaces:

- Object file in `src/objects/<name>.ts`
- Table view in `src/views/all-<plural>.ts`
- Object navigation item in `src/navigation-menu-items/<name>.ts`
- Record page layout in `src/page-layouts/<name>-record-page-layout.ts`
- Fields-widget view for the record page in `src/views/<name>-record-page-fields.ts`

Use `layout.md` for view, navigation, and page layout details.

Objects support `icon`, but object color is not defined on `defineObject()`. Put color on the object navigation item:

```ts
import {
  defineNavigationMenuItem,
  NavigationMenuItemType,
} from 'twenty-sdk/define';

export default defineNavigationMenuItem({
  universalIdentifier: '<uuid>',
  name: '<name>',
  icon: '<IconName>',
  color: '<color>',
  position: 0,
  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: '<object-uuid>',
});
```

### Minimal Object Example

```ts
import { defineObject, FieldType } from 'twenty-sdk/define';

export const OBJECT_UNIVERSAL_IDENTIFIER = '<uuid>';
export const NAME_FIELD_UNIVERSAL_IDENTIFIER = '<uuid>';

export default defineObject({
  universalIdentifier: OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: '<name>',
  namePlural: '<names>',
  labelSingular: '<Name>',
  labelPlural: '<Names>',
  icon: '<IconName>',
  labelIdentifierFieldMetadataUniversalIdentifier:
    NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      icon: 'IconAbc',
    },
  ],
});
```

### Select Fields

Select and multi-select option `value` strings must be uppercase snake case:

```ts
{
  type: FieldType.SELECT,
  name: 'status',
  label: 'Status',
  defaultValue: "'PLANNED'",
  options: [
    { position: 0, label: 'Planned', value: 'PLANNED', color: 'sky' },
    { position: 1, label: 'In build', value: 'IN_BUILD', color: 'orange' },
  ],
}
```

For select fields, default values must be quoted string expressions like `"'PLANNED'"`, not plain strings like `'planned'`.

## Roles And Permissions

Roles should match operational responsibility, not implementation convenience.

When adding permissions:

- Grant the smallest useful scope.
- Keep sensitive objects and fields out of broad roles.
- Check whether the app introduces side effects through logic functions before granting write access.

## Verification

After data model changes, run the app and verify the objects, fields, and roles appear where the user will manage or use them.
