import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES } from 'twenty-shared/constants';
import { FieldMetadataType } from 'twenty-shared/types';

// COMPOSITE_FIELD_SUB_FIELD_LABELS in twenty-shared stays English for the server and the import keys
export const COMPOSITE_FIELD_SUB_FIELD_LABEL_MESSAGES: {
  [key in keyof typeof COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES]: Record<
    string,
    MessageDescriptor
  >;
} = {
  [FieldMetadataType.CURRENCY]: {
    amountMicros: msg`Amount`,
    currencyCode: msg`Currency`,
  },
  [FieldMetadataType.EMAILS]: {
    primaryEmail: msg`Primary Email`,
    additionalEmails: msg`Additional Emails`,
  },
  [FieldMetadataType.LINKS]: {
    primaryLinkLabel: msg`Link Label`,
    primaryLinkUrl: msg`Link URL`,
    secondaryLinks: msg`Secondary Links`,
  },
  [FieldMetadataType.PHONES]: {
    primaryPhoneNumber: msg`Primary Phone Number`,
    primaryPhoneCountryCode: msg`Primary Phone Country Code`,
    primaryPhoneCallingCode: msg`Primary Phone Calling Code`,
    additionalPhones: msg`Additional Phones`,
  },
  [FieldMetadataType.FULL_NAME]: {
    firstName: msg`First Name`,
    lastName: msg`Last Name`,
  },
  [FieldMetadataType.ADDRESS]: {
    addressStreet1: msg`Address 1`,
    addressStreet2: msg`Address 2`,
    addressCity: msg`City`,
    addressState: msg`State`,
    addressCountry: msg`Country`,
    addressPostcode: msg`Post Code`,
    addressLat: msg`Latitude`,
    addressLng: msg`Longitude`,
  },
  [FieldMetadataType.ACTOR]: {
    source: msg`Source`,
    name: msg`Name`,
    workspaceMemberId: msg`Workspace Member`,
    context: msg`Context`,
  },
  [FieldMetadataType.RICH_TEXT]: {
    blocknote: msg`BlockNote`,
    markdown: msg`Markdown`,
  },
};
