/* eslint-disable @nx/workspace-max-consts-per-file */
import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import {
  FieldActorValue,
  FieldAddressValue,
  FieldCurrencyValue,
  FieldEmailsValue,
  FieldFullNameValue,
  FieldLinksValue,
  FieldLinkValue,
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
  labelBySubField: Record<keyof T, string>;
  subFieldByLabel: Record<string, keyof T>;
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
    subFields: ['amountMicros', 'currencyCode'],
    labelBySubField: {
      amountMicros: 'Amount',
      currencyCode: 'Currency',
    },
    subFieldByLabel: {
      Amount: 'amountMicros',
      Currency: 'currencyCode',
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
    labelBySubField: {
      primaryEmail: 'Primary Email',
      additionalEmails: 'Additional Emails',
    },
    subFieldByLabel: {
      'Primary Email': 'primaryEmail',
      'Additional Emails': 'additionalEmails',
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
  [FieldMetadataType.Link]: {
    label: 'Link',
    Icon: IllustrationIconLink,
    exampleValue: { url: 'www.twenty.com', label: '' },
    category: 'Basic',
    subFields: ['url', 'label'],
    labelBySubField: {
      url: 'URL',
      label: 'Label',
    },
    subFieldByLabel: {
      URL: 'url',
      Label: 'label',
    },
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldLinkValue>,
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
    labelBySubField: {
      primaryLinkUrl: 'Link URL',
      primaryLinkLabel: 'Link Label',
      secondaryLinks: 'Secondary Links',
    },
    subFieldByLabel: {
      'Link URL': 'primaryLinkUrl',
      'Link Label': 'primaryLinkLabel',
      'Secondary Links': 'secondaryLinks',
    },
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldLinksValue>,
  [FieldMetadataType.Phones]: {
    label: 'Phones',
    Icon: IllustrationIconPhone,
    exampleValue: {
      primaryPhoneNumber: '234-567-890',
      primaryPhoneCountryCode: '+1',
      additionalPhones: [{ number: '234-567-890', countryCode: '+1' }],
    },
    subFields: [
      'primaryPhoneNumber',
      'primaryPhoneCountryCode',
      'additionalPhones',
    ],
    labelBySubField: {
      primaryPhoneNumber: 'Primary Phone Number',
      primaryPhoneCountryCode: 'Primary Phone Country Code',
      additionalPhones: 'Additional Phones',
    },
    subFieldByLabel: {
      'Primary Phone Number': 'primaryPhoneNumber',
      'Primary Phone Country Code': 'primaryPhoneCountryCode',
      'Additional Phones': 'additionalPhones',
    },
    category: 'Basic',
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldPhonesValue>,
  [FieldMetadataType.FullName]: {
    label: 'Full Name',
    Icon: IllustrationIconUser,
    exampleValue: { firstName: 'John', lastName: 'Doe' },
    category: 'Advanced',
    subFields: ['firstName', 'lastName'],
    labelBySubField: {
      firstName: 'First Name',
      lastName: 'Last Name',
    },
    subFieldByLabel: {
      'First Name': 'firstName',
      'Last Name': 'lastName',
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
    subFieldByLabel: {
      'Address 1': 'addressStreet1',
      'Address 2': 'addressStreet2',
      City: 'addressCity',
      State: 'addressState',
      Country: 'addressCountry',
      'Post Code': 'addressPostcode',
      Latitude: 'addressLat',
      Longitude: 'addressLng',
    },
    exampleValue: {
      addressStreet1: '456 Oak Street',
      addressStreet2: 'Unit 3B',
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
    subFields: ['source', 'name', 'workspaceMemberId'],
    labelBySubField: {
      source: 'Source',
      name: 'Name',
      workspaceMemberId: 'Workspace Member ID',
    },
    subFieldByLabel: {
      Source: 'source',
      Name: 'name',
      'Workspace Member ID': 'workspaceMemberId',
    },
    exampleValue: { source: 'source', name: 'name', workspaceMemberId: 'id' },
  } as const satisfies SettingsCompositeFieldTypeConfig<FieldActorValue>,
} as const satisfies SettingsCompositeFieldTypeConfigArray;
