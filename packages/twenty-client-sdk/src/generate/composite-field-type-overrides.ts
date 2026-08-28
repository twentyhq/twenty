import type { Equal, Expect } from 'twenty-shared/testing';
import type {
  ActorMetadata,
  AdditionalPhoneMetadata,
  EmailsMetadata,
  LinkMetadata,
} from 'twenty-shared/types';

const ADDITIONAL_EMAILS_TYPE_TEXT = 'string[]';
const ADDITIONAL_PHONES_TYPE_TEXT =
  'Array<{ number: string; callingCode: string; countryCode: string }>';
const SECONDARY_LINKS_TYPE_TEXT = 'Array<{ label: string; url: string }>';
const ACTOR_CONTEXT_TYPE_TEXT = '{ provider?: string }';

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
