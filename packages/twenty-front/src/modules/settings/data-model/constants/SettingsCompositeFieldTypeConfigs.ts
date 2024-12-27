import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import {
  FieldActorValue,
  FieldAddressValue,
  FieldCurrencyValue,
  FieldEmailsValue,
  FieldFullNameValue,
  FieldLinksValue,
  FieldPhonesValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { SettingsFieldTypeConfig } from '@/settings/data-model/constants/SettingsNonCompositeFieldTypeConfigs';
import { CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import {
  IllustrationIconCurrency,
  IllustrationIconLink,
  IllustrationIconMail,
  IllustrationIconMap,
  IllustrationIconPhone,
  IllustrationIconSetting,
  IllustrationIconUser,
} from 'twenty-ui';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export type SettingsCompositeFieldTypeConfig<T> = SettingsFieldTypeConfig<T> & {
  subFields: (keyof T)[];
  filterableSubFields: (keyof T)[];
  labelBySubField: Record<keyof T, string>;
  exampleValue: T;
};

type SettingsCompositeFieldTypeConfigArray = Record<
  CompositeFieldType,
  SettingsCompositeFieldTypeConfig<any>
>;

export const SETTINGS_COMPOSITE_FIELD_TYPE_CONFIGS = {
  [FieldMetadataType.Currency]: {
    label: 'Currency',
    Icon: IllustrationIconCurrency,
    subFields: ['amountMicros'],
    filterableSubFields: ['amountMicros'],
    labelBySubField: {
      amountMicros: 'Amount',
      currencyCode: 'Currency',
    },
    exampleValue: {
      amountMicros: 2000000000,
      currencyCode: CurrencyCode.USD,
    },
    category: 'Basic',
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldCurrencyValue>,
  [FieldMetadataType.Emails]: {
    label: 'Emails',
    Icon: IllustrationIconMail,
    subFields: ['primaryEmail', 'additionalEmails'],
    filterableSubFields: ['primaryEmail'],
    labelBySubField: {
      primaryEmail: 'Primary Email',
      additionalEmails: 'Additional Emails',
    },
    exampleValue: {
      primaryEmail: 'john@twenty.com',
      additionalEmails: [
        'tim@twenty.com',
        'timapple@twenty.com',
        'johnappletim@twenty.com',
      ],
    },
    category: 'Basic',
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldEmailsValue>,
  [FieldMetadataType.Links]: {
    label: 'Links',
    Icon: IllustrationIconLink,
    exampleValue: {
      primaryLinkUrl: 'twenty.com',
      primaryLinkLabel: '',
      secondaryLinks: [{ url: 'twenty.com', label: 'Twenty' }],
    },
    category: 'Basic',
    subFields: ['primaryLinkUrl', 'primaryLinkLabel', 'secondaryLinks'],
    filterableSubFields: ['primaryLinkUrl', 'primaryLinkLabel'],
    labelBySubField: {
      primaryLinkUrl: 'Link URL',
      primaryLinkLabel: 'Link Label',
      secondaryLinks: 'Secondary Links',
    },
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldLinksValue>,
  [FieldMetadataType.Phones]: {
    label: 'Phones',
    Icon: IllustrationIconPhone,
    exampleValue: {
      primaryPhoneCallingCode: '+33',
      primaryPhoneCountryCode: 'FR',
      primaryPhoneNumber: '789012345',
      additionalPhones: [
        { number: '617272323', callingCode: '+33', countryCode: 'FR' },
      ],
    },
    subFields: [
      'primaryPhoneNumber',
      'primaryPhoneCountryCode',
      'additionalPhones',
    ],
    filterableSubFields: ['primaryPhoneNumber', 'primaryPhoneCountryCode'],
    labelBySubField: {
      primaryPhoneNumber: 'Primary Phone Number',
      primaryPhoneCountryCode: 'Primary Phone Country Code',
      primaryPhoneCallingCode: 'Primary Phone Calling Code',
      additionalPhones: 'Additional Phones',
    },
    category: 'Basic',
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldPhonesValue>,
  [FieldMetadataType.FullName]: {
    label: 'Full Name',
    Icon: IllustrationIconUser,
    exampleValue: { firstName: 'John', lastName: 'Doe' },
    category: 'Basic',
    subFields: ['firstName', 'lastName'],
    filterableSubFields: ['firstName', 'lastName'],
    labelBySubField: {
      firstName: 'First Name',
      lastName: 'Last Name',
    },
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldFullNameValue>,
  [FieldMetadataType.Address]: {
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
    labelBySubField: {
      addressStreet1: 'Address 1',
      addressStreet2: 'Address 2',
      addressCity: 'City',
      addressState: 'State',
      addressCountry: 'Country',
      addressPostcode: 'Post Code',
      addressLat: 'Latitude',
      addressLng: 'Longitude',
    },
    exampleValue: {
      addressStreet1: '456 Oak Street',
      addressStreet2: '',
      addressCity: 'Springfield',
      addressState: 'California',
      addressCountry: 'United States',
      addressPostcode: '90210',
      addressLat: 34.0522,
      addressLng: -118.2437,
    },
    category: 'Basic',
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldAddressValue>,
  [FieldMetadataType.Actor]: {
    label: 'Actor',
    Icon: IllustrationIconSetting,
    category: 'Basic',
    subFields: ['source'],
    filterableSubFields: ['source'],
    labelBySubField: {
      source: 'Source',
      name: 'Name',
      workspaceMemberId: 'Workspace Member ID',
    },
    exampleValue: { source: 'source', name: 'name', workspaceMemberId: 'id' },
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldActorValue>,
} as const satisfies SettingsCompositeFieldTypeConfigArray;
