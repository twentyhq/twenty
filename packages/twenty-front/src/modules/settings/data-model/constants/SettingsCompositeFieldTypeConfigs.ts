import {
  type FieldActorValue,
  type FieldAddressValue,
  type FieldCurrencyValue,
  type FieldEmailsValue,
  type FieldFullNameValue,
  type FieldLinksValue,
  type FieldPhonesValue,
  type FieldRichTextV2Value,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from '@/settings/data-model/constants/CompositeFieldSubFieldLabel';
import { type SettingsFieldTypeConfig } from '@/settings/data-model/constants/SettingsNonCompositeFieldTypeConfigs';
import { type CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import {
  COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES,
  CurrencyCode,
} from 'twenty-shared/constants';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import {
  IllustrationIconCurrency,
  IllustrationIconLink,
  IllustrationIconMail,
  IllustrationIconMap,
  IllustrationIconPhone,
  IllustrationIconSetting,
  IllustrationIconText,
  IllustrationIconUser,
} from 'twenty-ui/display';
import { FieldMetadataType } from '~/generated-metadata/graphql';

//TODO : isIncludedInUniqueConstraint refactor - https://github.com/twentyhq/core-team-issues/issues/1097

export type CompositeSubFieldConfig<T> = {
  subFieldName: keyof T;
  subFieldLabel: string;
  isImportable: boolean;
  isFilterable: boolean;
  isIncludedInUniqueConstraint: boolean;
};

export type SettingsCompositeFieldTypeConfig<T> = SettingsFieldTypeConfig<T> & {
  subFields: CompositeSubFieldConfig<T>[];
  exampleValues: [T, T, T];
};

type SettingsCompositeFieldTypeConfigArray = Record<
  CompositeFieldType,
  SettingsCompositeFieldTypeConfig<any>
>;

export const SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS = {
  [FieldMetadataType.CURRENCY]: {
    label: 'Currency',
    Icon: IllustrationIconCurrency,
    subFields: [
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.CURRENCY]
            .amountMicros,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.CURRENCY]
            .amountMicros,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: false,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.CURRENCY]
            .currencyCode,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.CURRENCY]
            .currencyCode,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: false,
      },
    ],
    exampleValues: [
      {
        amountMicros: 2000000000,
        currencyCode: CurrencyCode.USD,
      },
      {
        amountMicros: 3000000000,
        currencyCode: CurrencyCode.GBP,
      },
      {
        amountMicros: 100000000,
        currencyCode: CurrencyCode.AED,
      },
    ],
    category: 'Basic',
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldCurrencyValue>,
  [FieldMetadataType.EMAILS]: {
    label: 'Emails',
    Icon: IllustrationIconMail,
    subFields: [
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.EMAILS]
            .primaryEmail,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.EMAILS]
            .primaryEmail,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: true,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.EMAILS]
            .additionalEmails,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.EMAILS]
            .additionalEmails,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: false,
      },
    ],
    exampleValues: [
      {
        primaryEmail: 'tim@twenty.com',
        additionalEmails: [
          'tim@twenty.com',
          'timapple@twenty.com',
          'johnappletim@twenty.com',
        ],
      },
      {
        primaryEmail: 'jane@twenty.com',
        additionalEmails: ['jane@twenty.com', 'jane.doe@twenty.com'],
      },
      {
        primaryEmail: 'john@twenty.com',
        additionalEmails: ['john.doe@twenty.com'],
      },
    ],
    category: 'Basic',
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldEmailsValue>,
  [FieldMetadataType.LINKS]: {
    label: 'Links',
    Icon: IllustrationIconLink,
    subFields: [
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.LINKS]
            .primaryLinkUrl,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.LINKS]
            .primaryLinkUrl,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: true,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.LINKS]
            .primaryLinkLabel,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.LINKS]
            .primaryLinkLabel,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: false,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.LINKS]
            .secondaryLinks,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.LINKS]
            .secondaryLinks,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: false,
      },
    ],
    exampleValues: [
      {
        primaryLinkUrl: 'twenty.com',
        primaryLinkLabel: '',
        secondaryLinks: [{ url: 'twenty.com', label: 'Twenty' }],
      },
      {
        primaryLinkUrl: 'github.com/twentyhq/twenty',
        primaryLinkLabel: 'Twenty Repo',
        secondaryLinks: [{ url: 'twenty.com', label: '' }],
      },
      {
        primaryLinkUrl: 'react.dev',
        primaryLinkLabel: '',
        secondaryLinks: [],
      },
    ],
    category: 'Basic',
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldLinksValue>,
  [FieldMetadataType.PHONES]: {
    label: 'Phones',
    Icon: IllustrationIconPhone,
    subFields: [
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.PHONES]
            .primaryPhoneCallingCode,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.PHONES]
            .primaryPhoneCallingCode,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: false,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.PHONES]
            .primaryPhoneCountryCode,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.PHONES]
            .primaryPhoneCountryCode,
        isImportable: true,
        isFilterable: false,
        isIncludedInUniqueConstraint: false,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.PHONES]
            .primaryPhoneNumber,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.PHONES]
            .primaryPhoneNumber,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: true,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.PHONES]
            .additionalPhones,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.PHONES]
            .additionalPhones,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: false,
      },
    ],
    exampleValues: [
      {
        primaryPhoneCallingCode: '+33',
        primaryPhoneCountryCode: 'FR',
        primaryPhoneNumber: '789012345',
        additionalPhones: [
          { number: '617272323', callingCode: '+33', countryCode: 'FR' },
        ],
      },
      {
        primaryPhoneCallingCode: '+1',
        primaryPhoneCountryCode: 'US',
        primaryPhoneNumber: '612345789',
        additionalPhones: [
          { number: '123456789', callingCode: '+1', countryCode: 'US' },
          { number: '617272323', callingCode: '+1', countryCode: 'US' },
        ],
      },
      {
        primaryPhoneCallingCode: '+33',
        primaryPhoneCountryCode: 'FR',
        primaryPhoneNumber: '123456789',
        additionalPhones: [],
      },
    ],
    category: 'Basic',
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldPhonesValue>,
  [FieldMetadataType.FULL_NAME]: {
    label: 'Full Name',
    Icon: IllustrationIconUser,
    subFields: [
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.FULL_NAME]
            .firstName,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.FULL_NAME]
            .firstName,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: false,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.FULL_NAME]
            .lastName,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.FULL_NAME]
            .lastName,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: false,
      },
    ],
    exampleValues: [
      { firstName: 'John', lastName: 'Doe' },
      { firstName: 'Jane', lastName: 'Doe' },
      { firstName: 'John', lastName: 'Smith' },
    ],
    category: 'Basic',
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldFullNameValue>,
  [FieldMetadataType.ADDRESS]: {
    label: 'Address',
    Icon: IllustrationIconMap,
    subFields: [
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.ADDRESS]
            .addressStreet1,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ADDRESS]
            .addressStreet1,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: false,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.ADDRESS]
            .addressStreet2,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ADDRESS]
            .addressStreet2,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: false,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.ADDRESS]
            .addressCity,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ADDRESS]
            .addressCity,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: false,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.ADDRESS]
            .addressState,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ADDRESS]
            .addressState,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: false,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.ADDRESS]
            .addressCountry,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ADDRESS]
            .addressCountry,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: false,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.ADDRESS]
            .addressPostcode,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ADDRESS]
            .addressPostcode,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: false,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.ADDRESS]
            .addressLat,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ADDRESS]
            .addressLat,
        isImportable: false,
        isFilterable: false,
        isIncludedInUniqueConstraint: false,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.ADDRESS]
            .addressLng,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ADDRESS]
            .addressLng,
        isImportable: false,
        isFilterable: false,
        isIncludedInUniqueConstraint: false,
      },
    ],
    exampleValues: [
      {
        addressStreet1: '456 Oak Street',
        addressStreet2: '',
        addressCity: 'Springfield',
        addressState: 'California',
        addressCountry: 'United States',
        addressPostcode: '90210',
        addressLat: 34.0522,
        addressLng: -118.2437,
      },
      {
        addressStreet1: '123 Main Street',
        addressStreet2: '',
        addressCity: 'New York',
        addressState: 'New York',
        addressCountry: 'United States',
        addressPostcode: '10001',
        addressLat: 40.7128,
        addressLng: -74.006,
      },
      {
        addressStreet1: '8 rue Saint-Anne',
        addressStreet2: '',
        addressCity: 'Paris',
        addressState: 'Ile-de-France',
        addressCountry: 'France',
        addressPostcode: '75001',
        addressLat: 40.7128,
        addressLng: -74.006,
      },
    ],
    category: 'Basic',
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldAddressValue>,
  [FieldMetadataType.ACTOR]: {
    label: 'Actor',
    Icon: IllustrationIconSetting,
    category: 'Basic',
    subFields: [
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.ACTOR].source,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ACTOR].source,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: false,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.ACTOR].name,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ACTOR].name,
        isImportable: true,
        isFilterable: true,
        isIncludedInUniqueConstraint: false,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.ACTOR]
            .workspaceMemberId,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ACTOR]
            .workspaceMemberId,
        isImportable: true,
        isFilterable: false,
        isIncludedInUniqueConstraint: false,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.ACTOR]
            .context,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ACTOR].context,
        isImportable: true,
        isFilterable: false,
        isIncludedInUniqueConstraint: false,
      },
    ],
    exampleValues: [
      {
        source: 'IMPORT',
        name: 'name',
        workspaceMemberId: 'id',
        context: { provider: ConnectedAccountProvider.GOOGLE },
      },
      {
        source: 'MANUAL',
        name: 'name',
        workspaceMemberId: 'id',
        context: { provider: ConnectedAccountProvider.MICROSOFT },
      },
      {
        source: 'WEBHOOK',
        name: 'name',
        workspaceMemberId: 'id',
        context: {},
      },
    ],
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldActorValue>,
  [FieldMetadataType.RICH_TEXT_V2]: {
    label: 'Rich Text',
    Icon: IllustrationIconText,
    category: 'Basic',
    subFields: [
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.RICH_TEXT_V2]
            .blocknote,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.RICH_TEXT_V2]
            .blocknote,
        isImportable: false,
        isFilterable: false,
        isIncludedInUniqueConstraint: false,
      },
      {
        subFieldName:
          COMPOSITE_FIELD_TYPE_SUB_FIELDS_NAMES[FieldMetadataType.RICH_TEXT_V2]
            .markdown,
        subFieldLabel:
          COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.RICH_TEXT_V2]
            .markdown,
        isImportable: true,
        isFilterable: false,
        isIncludedInUniqueConstraint: false,
      },
    ],
    exampleValues: [
      {
        blocknote: '[{"type":"heading","content":"Hello"}]',
        markdown: '# Hello',
      },
      {
        blocknote: '[{"type":"heading","content":"Hello World"}]',
        markdown: '# Hello World',
      },
      {
        blocknote: '[{"type":"heading","content":"Hello Again"}]',
        markdown: '# Hello Again',
      },
    ],
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldRichTextV2Value>,
} as const satisfies SettingsCompositeFieldTypeConfigArray;
