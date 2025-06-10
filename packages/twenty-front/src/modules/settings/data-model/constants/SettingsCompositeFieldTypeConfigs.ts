import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
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
import { COMPOSITE_FIELD_SUB_FIELD_LABELS } from '@/settings/data-model/constants/CompositeFieldSubFieldLabel';
import { SettingsFieldTypeConfig } from '@/settings/data-model/constants/SettingsNonCompositeFieldTypeConfigs';
import { CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
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

export type SettingsCompositeFieldTypeConfig<T> = SettingsFieldTypeConfig<T> & {
  subFields: (keyof T)[];
  filterableSubFields: (keyof T)[];
  importableSubFields?: (keyof T)[];
  labelBySubField: Record<keyof T, string>;
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
    subFields: ['amountMicros', 'currencyCode'],
    filterableSubFields: ['amountMicros', 'currencyCode'],
    labelBySubField: {
      amountMicros:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.CURRENCY]
          .amountMicros,
      currencyCode:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.CURRENCY]
          .currencyCode,
    },
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
    subFields: ['primaryEmail', 'additionalEmails'],
    filterableSubFields: ['primaryEmail', 'additionalEmails'],
    labelBySubField: {
      primaryEmail: 'Primary Email',
      additionalEmails: 'Additional Emails',
    },
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
    subFields: ['primaryLinkUrl', 'primaryLinkLabel', 'secondaryLinks'],
    filterableSubFields: [
      'primaryLinkUrl',
      'primaryLinkLabel',
      'secondaryLinks',
    ],
    labelBySubField: {
      primaryLinkUrl:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.LINKS]
          .primaryLinkUrl,
      primaryLinkLabel:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.LINKS]
          .primaryLinkLabel,
      secondaryLinks:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.LINKS]
          .secondaryLinks,
    },
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldLinksValue>,
  [FieldMetadataType.PHONES]: {
    label: 'Phones',
    Icon: IllustrationIconPhone,
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
    subFields: [
      'primaryPhoneNumber',
      'primaryPhoneCountryCode',
      'primaryPhoneCallingCode',
      'additionalPhones',
    ],
    filterableSubFields: [
      'primaryPhoneNumber',
      'primaryPhoneCallingCode',
      'additionalPhones',
    ],
    labelBySubField: {
      primaryPhoneNumber:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.PHONES]
          .primaryPhoneNumber,
      primaryPhoneCountryCode:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.PHONES]
          .primaryPhoneCountryCode,
      primaryPhoneCallingCode:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.PHONES]
          .primaryPhoneCallingCode,
      additionalPhones:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.PHONES]
          .additionalPhones,
    },
    category: 'Basic',
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldPhonesValue>,
  [FieldMetadataType.FULL_NAME]: {
    label: 'Full Name',
    Icon: IllustrationIconUser,
    exampleValues: [
      { firstName: 'John', lastName: 'Doe' },
      { firstName: 'Jane', lastName: 'Doe' },
      { firstName: 'John', lastName: 'Smith' },
    ],
    category: 'Basic',
    subFields: ['firstName', 'lastName'],
    filterableSubFields: ['firstName', 'lastName'],
    labelBySubField: {
      firstName:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.FULL_NAME].firstName,
      lastName:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.FULL_NAME].lastName,
    },
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldFullNameValue>,
  [FieldMetadataType.ADDRESS]: {
    label: 'Address',
    Icon: IllustrationIconMap,
    subFields: [
      'addressStreet1',
      'addressStreet2',
      'addressCity',
      'addressState',
      'addressCountry',
      'addressPostcode',
      'addressLat',
      'addressLng',
    ],
    filterableSubFields: [
      'addressStreet1',
      'addressStreet2',
      'addressCity',
      'addressState',
      'addressCountry',
      'addressPostcode',
    ],
    importableSubFields: [
      'addressStreet1',
      'addressStreet2',
      'addressCity',
      'addressState',
      'addressCountry',
      'addressPostcode',
    ],
    labelBySubField: {
      addressStreet1:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ADDRESS]
          .addressStreet1,
      addressStreet2:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ADDRESS]
          .addressStreet2,
      addressCity:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ADDRESS].addressCity,
      addressState:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ADDRESS]
          .addressState,
      addressCountry:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ADDRESS]
          .addressCountry,
      addressPostcode:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ADDRESS]
          .addressPostcode,
      addressLat:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ADDRESS].addressLat,
      addressLng:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ADDRESS].addressLng,
    },
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
    subFields: ['source', 'name'],
    filterableSubFields: ['source', 'name'],
    labelBySubField: {
      source: COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ACTOR].source,
      name: COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ACTOR].name,
      workspaceMemberId:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ACTOR]
          .workspaceMemberId,
      context:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.ACTOR].context,
    },
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
    subFields: ['blocknote', 'markdown'],
    filterableSubFields: [],
    labelBySubField: {
      blocknote:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.RICH_TEXT_V2]
          .blocknote,
      markdown:
        COMPOSITE_FIELD_SUB_FIELD_LABELS[FieldMetadataType.RICH_TEXT_V2]
          .markdown,
    },
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
    category: 'Basic',
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldRichTextV2Value>,
} as const satisfies SettingsCompositeFieldTypeConfigArray;
