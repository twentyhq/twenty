import {
  FieldAddressValue,
  FieldCurrencyValue,
  FieldEmailsValue,
  FieldFullNameValue,
  FieldLinksValue,
  FieldPhonesValue,
  FieldRichTextV2Value,
} from '@/object-record/record-field/types/FieldMetadata';
import { CompositeFieldLabels } from '@/object-record/spreadsheet-import/types/CompositeFieldLabels';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const COMPOSITE_FIELD_IMPORT_LABELS = {
  [FieldMetadataType.FULL_NAME]: {
    firstNameLabel: 'First Name',
    lastNameLabel: 'Last Name',
  } satisfies CompositeFieldLabels<FieldFullNameValue>,
  [FieldMetadataType.CURRENCY]: {
    currencyCodeLabel: 'Currency Code',
    amountMicrosLabel: 'Amount',
  } satisfies CompositeFieldLabels<FieldCurrencyValue>,
  [FieldMetadataType.ADDRESS]: {
    addressStreet1Label: 'Address 1',
    addressStreet2Label: 'Address 2',
    addressCityLabel: 'City',
    addressPostcodeLabel: 'Post Code',
    addressStateLabel: 'State',
    addressCountryLabel: 'Country',
    addressLatLabel: 'Latitude',
    addressLngLabel: 'Longitude',
  } satisfies CompositeFieldLabels<FieldAddressValue>,
  [FieldMetadataType.LINKS]: {
    // primaryLinkLabelLabel excluded from composite field import labels since it's not used in Links input
    primaryLinkUrlLabel: 'Link URL',
  } satisfies Partial<CompositeFieldLabels<FieldLinksValue>>,
  [FieldMetadataType.EMAILS]: {
    primaryEmailLabel: 'Email',
  } satisfies Partial<CompositeFieldLabels<FieldEmailsValue>>,
  [FieldMetadataType.PHONES]: {
    primaryPhoneCountryCodeLabel: 'Phone country code',
    primaryPhoneNumberLabel: 'Phone number',
  } satisfies Partial<CompositeFieldLabels<FieldPhonesValue>>,
  [FieldMetadataType.RICH_TEXT_V2]: {
    blocknoteLabel: 'BlockNote',
    markdownLabel: 'Markdown',
  } satisfies Partial<CompositeFieldLabels<FieldRichTextV2Value>>,
  [FieldMetadataType.ACTOR]: {
    sourceLabel: 'Source',
  },
};
