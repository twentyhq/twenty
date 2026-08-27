import type { Equal, Expect } from 'twenty-shared/testing';
import type {
  ActorMetadata,
  AdditionalPhoneMetadata,
  EmailsMetadata,
  LinkMetadata,
} from 'twenty-shared/types';

// Composite sub-fields stored as RAW_JSON reach the workspace GraphQL schema
// as the untyped JSON scalar, so codegen alone would type them
// Record<string, unknown>. Their runtime shape is fixed by the composite
// definitions in twenty-shared; these literals inline that shape into the
// generated client, which must stay free of imports.
const ADDITIONAL_EMAILS_TYPE_TEXT = 'string[]';
const ADDITIONAL_PHONES_TYPE_TEXT =
  'Array<{ number: string; callingCode: string; countryCode: string }>';
const SECONDARY_LINKS_TYPE_TEXT = 'Array<{ label: string; url: string }>';
const ACTOR_CONTEXT_TYPE_TEXT = '{ provider?: string }';

// Fails this package's typecheck when a composite metadata type in
// twenty-shared drifts from the literals above. Branded string values
// (enums, CountryCode) are deliberately widened to string in the client.
type WidenStringValues<TObject> = {
  [TKey in keyof TObject]: TObject[TKey] extends string | undefined
    ? string
    : TObject[TKey];
};

export type CompositeFieldTypeOverrideDriftGuards = [
  Expect<Equal<string[], NonNullable<EmailsMetadata['additionalEmails']>>>,
  Expect<
    Equal<
      { number: string; callingCode: string; countryCode: string },
      WidenStringValues<AdditionalPhoneMetadata>
    >
  >,
  Expect<Equal<{ label: string; url: string }, LinkMetadata>>,
  Expect<
    Equal<{ provider?: string }, WidenStringValues<ActorMetadata['context']>>
  >,
];

// Keyed by the type names the workspace schema builder emits for composite
// fields: the plain object type plus its Create/Update input variants. These
// names are workspace-independent, so one static map covers every schema.
// Filter/OrderBy/GroupBy inputs never expose the raw JSON value.
export const COMPOSITE_FIELD_TYPE_OVERRIDES: {
  [typeName: string]: { [fieldName: string]: string };
} = {
  Emails: { additionalEmails: ADDITIONAL_EMAILS_TYPE_TEXT },
  EmailsCreateInput: { additionalEmails: ADDITIONAL_EMAILS_TYPE_TEXT },
  EmailsUpdateInput: { additionalEmails: ADDITIONAL_EMAILS_TYPE_TEXT },
  Phones: { additionalPhones: ADDITIONAL_PHONES_TYPE_TEXT },
  PhonesCreateInput: { additionalPhones: ADDITIONAL_PHONES_TYPE_TEXT },
  PhonesUpdateInput: { additionalPhones: ADDITIONAL_PHONES_TYPE_TEXT },
  Links: { secondaryLinks: SECONDARY_LINKS_TYPE_TEXT },
  LinksCreateInput: { secondaryLinks: SECONDARY_LINKS_TYPE_TEXT },
  LinksUpdateInput: { secondaryLinks: SECONDARY_LINKS_TYPE_TEXT },
  Actor: { context: ACTOR_CONTEXT_TYPE_TEXT },
  ActorCreateInput: { context: ACTOR_CONTEXT_TYPE_TEXT },
  ActorUpdateInput: { context: ACTOR_CONTEXT_TYPE_TEXT },
};

const findMatchingBrace = (source: string, openBraceIndex: number): number => {
  let depth = 0;

  for (let index = openBraceIndex; index < source.length; index++) {
    if (source[index] === '{') {
      depth++;
    }

    if (source[index] === '}') {
      depth--;

      if (depth === 0) {
        return index;
      }
    }
  }

  throw new Error('Unbalanced braces in generated schema types');
};

// Rewrites the generated schema.ts so composite RAW_JSON sub-fields carry
// their real shape. Runs as a post-processing pass so the vendored genql
// engine stays verbatim; nullability/optionality wrapping emitted by the
// engine is preserved because only the Scalars['JSON'] reference is swapped.
// A composite type absent from the schema (minimal test schemas, metadata)
// is skipped; a present type whose field no longer renders as the JSON
// scalar fails loudly, so engine-output drift surfaces at generation time.
export const applyCompositeFieldTypeOverrides = (
  schemaTypesSource: string,
): string => {
  let source = schemaTypesSource;

  for (const [typeName, fieldOverrides] of Object.entries(
    COMPOSITE_FIELD_TYPE_OVERRIDES,
  )) {
    const interfaceHeader = `export interface ${typeName} {`;
    const headerIndex = source.indexOf(interfaceHeader);

    if (headerIndex === -1) {
      continue;
    }

    const blockStart = headerIndex + interfaceHeader.length - 1;
    const blockEnd = findMatchingBrace(source, blockStart);
    let block = source.slice(blockStart, blockEnd + 1);

    for (const [fieldName, overriddenType] of Object.entries(fieldOverrides)) {
      const fieldPattern = new RegExp(
        `(${fieldName}\\?: \\(?)Scalars\\['JSON'\\]`,
      );

      if (!fieldPattern.test(block)) {
        throw new Error(
          `Expected ${typeName}.${fieldName} to render as the JSON scalar in the generated client; the genql engine output changed shape`,
        );
      }

      block = block.replace(
        fieldPattern,
        (_match, fieldPrefix) => `${fieldPrefix}${overriddenType}`,
      );
    }

    source = source.slice(0, blockStart) + block + source.slice(blockEnd + 1);
  }

  return source;
};
