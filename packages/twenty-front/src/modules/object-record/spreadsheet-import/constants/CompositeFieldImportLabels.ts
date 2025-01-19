import {
  FieldAddressValue,
  FieldCurrencyValue,
  FieldEmailsValue,
  FieldFullNameValue,
  FieldLinksValue,
  FieldPhonesValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { CompositeFieldLabels } from '@/object-record/spreadsheet-import/types/CompositeFieldLabels';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const COMPOSITE_FIELD_IMPORT_LABELS = {
  [FieldMetadataType.FullName]: {
    firstNameLabel: 'First Name',
    lastNameLabel: 'Last Name',
  } satisfies CompositeFieldLabels<FieldFullNameValue>,
  [FieldMetadataType.Currency]: {
    currencyCodeLabel: 'Currency Code',
    amountMicrosLabel: 'Amount',
  } satisfies CompositeFieldLabels<FieldCurrencyValue>,
  [FieldMetadataType.Address]: {
    addressStreet1Label: 'Address 1',
    addressStreet2Label: 'Address 2',
    addressCityLabel: 'City',
    addressPostcodeLabel: 'Post Code',
    addressStateLabel: 'State',
    addressCountryLabel: 'Country',
    addressLatLabel: 'Latitude',
    addressLngLabel: 'Longitude',
  } satisfies CompositeFieldLabels<FieldAddressValue>,
  [FieldMetadataType.Links]: {
    primaryLinkUrlLabel: 'Link URL',
    primaryLinkLabelLabel: 'Link Label',
  } satisfies Partial<CompositeFieldLabels<FieldLinksValue>>,
  [FieldMetadataType.Emails]: {
    primaryEmailLabel: 'Email',
  } satisfies Partial<CompositeFieldLabels<FieldEmailsValue>>,
  [FieldMetadataType.Phones]: {
    primaryPhoneCountryCodeLabel: 'Phone country code',
    primaryPhoneNumberLabel: 'Phone number',
  } satisfies Partial<CompositeFieldLabels<FieldPhonesValue>>,
  [FieldMetadataType.Actor]: {
    sourceLabel: 'Source',
  },
};
