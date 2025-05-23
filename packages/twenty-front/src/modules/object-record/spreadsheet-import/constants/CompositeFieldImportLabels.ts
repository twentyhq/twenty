import {
  FieldActorValue,
  FieldAddressValue,
  FieldCurrencyValue,
  FieldEmailsValue,
  FieldFullNameValue,
  FieldLinksValue,
  FieldPhonesValue,
  FieldRichTextV2Value,
} from '@/object-record/record-field/types/FieldMetadata';
import { CompositeFieldLabels } from '@/object-record/spreadsheet-import/types/CompositeFieldLabels';
import { SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS } from '@/settings/data-model/constants/SettingsCompositeFieldTypeConfigs';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const COMPOSITE_FIELD_IMPORT_LABELS = {
  [FieldMetadataType.FULL_NAME]: {
    firstNameLabel:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.FULL_NAME.labelBySubField.firstName,
    lastNameLabel:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.FULL_NAME.labelBySubField.lastName,
  } satisfies CompositeFieldLabels<FieldFullNameValue>,
  [FieldMetadataType.CURRENCY]: {
    currencyCodeLabel:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.CURRENCY.labelBySubField
        .currencyCode,
    amountMicrosLabel:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.CURRENCY.labelBySubField
        .amountMicros,
  } satisfies CompositeFieldLabels<FieldCurrencyValue>,
  [FieldMetadataType.ADDRESS]: {
    addressStreet1Label:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.ADDRESS.labelBySubField
        .addressStreet1,
    addressStreet2Label:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.ADDRESS.labelBySubField
        .addressStreet2,
    addressCityLabel:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.ADDRESS.labelBySubField.addressCity,
    addressPostcodeLabel:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.ADDRESS.labelBySubField
        .addressPostcode,
    addressStateLabel:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.ADDRESS.labelBySubField
        .addressState,
    addressCountryLabel:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.ADDRESS.labelBySubField
        .addressCountry,
  } satisfies Omit<
    CompositeFieldLabels<FieldAddressValue>,
    'addressLatLabel' | 'addressLngLabel'
  >,
  [FieldMetadataType.LINKS]: {
    primaryLinkUrlLabel:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.LINKS.labelBySubField
        .primaryLinkUrl,
    secondaryLinksLabel:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.LINKS.labelBySubField
        .secondaryLinks,
  } satisfies Partial<CompositeFieldLabels<FieldLinksValue>>,
  [FieldMetadataType.EMAILS]: {
    primaryEmailLabel:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.EMAILS.labelBySubField.primaryEmail,
    additionalEmailsLabel:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.EMAILS.labelBySubField
        .additionalEmails,
  } satisfies Partial<CompositeFieldLabels<FieldEmailsValue>>,
  [FieldMetadataType.PHONES]: {
    primaryPhoneCountryCodeLabel:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.PHONES.labelBySubField
        .primaryPhoneCountryCode,
    primaryPhoneNumberLabel:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.PHONES.labelBySubField
        .primaryPhoneNumber,
  } satisfies Partial<CompositeFieldLabels<FieldPhonesValue>>,
  [FieldMetadataType.RICH_TEXT_V2]: {
    blocknoteLabel:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.RICH_TEXT_V2.labelBySubField
        .blocknote,
    markdownLabel:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.RICH_TEXT_V2.labelBySubField
        .markdown,
  } satisfies Partial<CompositeFieldLabels<FieldRichTextV2Value>>,
  [FieldMetadataType.ACTOR]: {
    sourceLabel:
      SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.ACTOR.labelBySubField.source,
    nameLabel: SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS.ACTOR.labelBySubField.name,
  } satisfies Partial<CompositeFieldLabels<FieldActorValue>>,
};
