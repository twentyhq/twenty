# Logic function inputs

When a logic function opts into the workflow action or AI tool surface but does
not declare an explicit `inputSchema`, the SDK infers one from the handler's
parameter type during the manifest build. The workflow builder uses that schema
to render an input form, and record-typed inputs render as record pickers.

## How inference works

Inference reads the handler's single `params` object type and maps each property:

- `string` / `number` / `boolean` map to the matching scalar input.
- String literal unions (`'a' | 'b'`) map to a select input.
- `T[]` / `Array<T>` map to array inputs.
- `TwentyRecord<'objectUniversalIdentifier'>` maps to a record input (see below).

Inference runs only when the trigger settings omit `inputSchema`. Providing an
explicit `inputSchema` disables inference for that surface entirely — this is the
escape hatch when a handler type cannot be expressed inline.

## Record-typed inputs

To bind an input to a workspace object, type it with `TwentyRecord`, passing the
object's universal identifier as a string literal:

```ts
import { defineLogicFunction, type TwentyRecord } from 'twenty-sdk/define';

const handler = async (params: {
  companyId: TwentyRecord<'20202020-b374-4779-a561-80086cb2e17f'>;
  postCardIds: TwentyRecord<'54b589ca-eeed-4950-a176-358418b85c05'>[];
}) => {
  return {
    companyId: params.companyId,
    postCardCount: params.postCardIds.length,
  };
};
```

The universal identifier is the source of truth and is read directly from the
literal — there is no name matching, so an unrelated type can never be mistaken
for a record.

- **Standard objects**: get the identifier from `STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS`
  (exported from `twenty-sdk/define`), e.g.
  `STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier`.
- **App objects**: use the `universalIdentifier` you set on the object's
  `defineObject(...)`.

Only a string-literal argument resolves. `TwentyRecord` with no argument, or with
a non-literal argument, is treated as an unknown input.

## What the handler receives

`TwentyRecord<TUid>` is a branded `string`: `companyId` is a record id, and
`postCardIds` is an array of record ids. This matches what the runtime delivers —
the workflow action passes the selected record ids (or the value a bound
`{{variable}}` resolves to) straight to the handler. Handlers must therefore
accept ids. The People Data Labs functions model this:

```ts
export type RecordInput = string | { id?: string | null };
```

and normalize the input with an `extractRecordIds` helper before use. If a
handler needs full records, it fetches them by id with the Core API client.
