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
