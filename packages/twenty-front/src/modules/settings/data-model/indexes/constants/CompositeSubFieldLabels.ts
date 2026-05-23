import { FieldMetadataType } from '~/generated-metadata/graphql';

// User-facing labels for composite-type sub-properties. The composite type
// definitions in twenty-shared only carry the technical name (e.g.
// 'addressCity') — these strings are what we show in the field picker and the
// "Fields" column on the indexes table.
//
// Keys mirror the `name` of each CompositeProperty in
// twenty-shared/src/types/composite-types/<type>.composite-type.ts.
export const COMPOSITE_SUB_FIELD_LABELS: Partial<
  Record<FieldMetadataType, Record<string, string>>
> = {
  [FieldMetadataType.ADDRESS]: {
    addressStreet1: 'Street 1',
    addressStreet2: 'Street 2',
    addressCity: 'City',
    addressPostcode: 'Postcode',
    addressState: 'State',
    addressCountry: 'Country',
    addressLat: 'Latitude',
    addressLng: 'Longitude',
  },
  [FieldMetadataType.CURRENCY]: {
    amountMicros: 'Amount',
    currencyCode: 'Currency code',
  },
  [FieldMetadataType.FULL_NAME]: {
    firstName: 'First name',
    lastName: 'Last name',
  },
  [FieldMetadataType.LINKS]: {
    primaryLinkLabel: 'Primary URL label',
    primaryLinkUrl: 'Primary URL',
    secondaryLinks: 'Secondary links',
  },
  [FieldMetadataType.EMAILS]: {
    primaryEmail: 'Primary email',
    additionalEmails: 'Additional emails',
  },
  [FieldMetadataType.PHONES]: {
    primaryPhoneNumber: 'Primary number',
    primaryPhoneCountryCode: 'Primary country code',
    primaryPhoneCallingCode: 'Primary calling code',
    additionalPhones: 'Additional phones',
  },
  [FieldMetadataType.ACTOR]: {
    source: 'Source',
    workspaceMemberId: 'Workspace member',
    name: 'Name',
    context: 'Context',
  },
  [FieldMetadataType.RICH_TEXT]: {
    blocknote: 'Blocknote',
    markdown: 'Markdown',
  },
};

export const getCompositeSubFieldLabel = (
  parentType: FieldMetadataType,
  subFieldName: string,
): string =>
  COMPOSITE_SUB_FIELD_LABELS[parentType]?.[subFieldName] ?? subFieldName;
