import { FieldMetadataType } from 'twenty-shared/types';

/**
 * Human-readable labels for composite field sub-fields.
 * Mirrors the frontend COMPOSITE_FIELD_SUB_FIELD_LABELS constant.
 */
export const COMPOSITE_FIELD_SUB_FIELD_LABELS: Partial<
  Record<FieldMetadataType, Record<string, string>>
> = {
  [FieldMetadataType.CURRENCY]: {
    amountMicros: 'Amount',
    currencyCode: 'Currency',
  },
  [FieldMetadataType.EMAILS]: {
    primaryEmail: 'Primary Email',
    additionalEmails: 'Additional Emails',
  },
  [FieldMetadataType.LINKS]: {
    primaryLinkLabel: 'Link Label',
    primaryLinkUrl: 'Link URL',
    secondaryLinks: 'Secondary Links',
  },
  [FieldMetadataType.PHONES]: {
    primaryPhoneNumber: 'Primary Phone Number',
    primaryPhoneCountryCode: 'Primary Phone Country Code',
    primaryPhoneCallingCode: 'Primary Phone Calling Code',
    additionalPhones: 'Additional Phones',
  },
  [FieldMetadataType.FULL_NAME]: {
    firstName: 'First Name',
    lastName: 'Last Name',
  },
  [FieldMetadataType.ADDRESS]: {
    addressStreet1: 'Address 1',
    addressStreet2: 'Address 2',
    addressCity: 'City',
    addressState: 'State',
    addressCountry: 'Country',
    addressPostcode: 'Post Code',
    addressLat: 'Latitude',
    addressLng: 'Longitude',
  },
};

const COMPOSITE_FIELD_TYPES = new Set(Object.keys(COMPOSITE_FIELD_SUB_FIELD_LABELS));

export function isCompositeFieldType(fieldType: string): boolean {
  return COMPOSITE_FIELD_TYPES.has(fieldType);
}
