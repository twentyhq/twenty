import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { FieldMetadataType } from 'twenty-shared/types';

export const COMPOSITE_FIELD_SUB_FIELD_LABELS: {
  [key in CompositeFieldType]: Record<string, string>;
} = {
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
  [FieldMetadataType.ACTOR]: {
    source: 'Source',
    name: 'Name',
    workspaceMemberId: 'Workspace Member ID',
    context: 'Context',
  },
  [FieldMetadataType.RICH_TEXT_V2]: {
    blocknote: 'BlockNote',
    markdown: 'Markdown',
  },
};
