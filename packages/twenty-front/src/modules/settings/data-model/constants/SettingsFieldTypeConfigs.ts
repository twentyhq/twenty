import {
  IconCalendarEvent,
  IconCalendarTime,
  IconCheck,
  IconCoins,
  IconComponent,
  IconCreativeCommonsSa,
  IconFilePencil,
  IconJson,
  IconKey,
  IconLink,
  IconMail,
  IconMap,
  IconNumbers,
  IconPhone,
  IconRelationManyToMany,
  IconTag,
  IconTags,
  IconTextSize,
  IconTwentyStar,
  IconUser,
} from 'twenty-ui';

import { CurrencyCode } from '@/object-record/record-field/types/CurrencyCode';
import { DEFAULT_DATE_VALUE } from '@/settings/data-model/constants/DefaultDateValue';
import { SettingsFieldTypeCategoryType } from '@/settings/data-model/types/SettingsFieldTypeCategoryType';
import { SettingsSupportedFieldType } from '@/settings/data-model/types/SettingsSupportedFieldType';
import { FieldMetadataType } from '~/generated-metadata/graphql';

DEFAULT_DATE_VALUE.setFullYear(DEFAULT_DATE_VALUE.getFullYear() + 2);

export type SettingsFieldTypeConfig = {
  label: string;
  Icon: IconComponent;
  exampleValue?: unknown;
  category: SettingsFieldTypeCategoryType;
};

export const SETTINGS_FIELD_TYPE_CONFIGS = {
  [FieldMetadataType.Uuid]: {
    label: 'Unique ID',
    Icon: IconKey,
    exampleValue: '00000000-0000-0000-0000-000000000000',
    category: 'Advanced',
  },
  [FieldMetadataType.Text]: {
    label: 'Text',
    Icon: IconTextSize,
    exampleValue:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
    category: 'Basic',
  },
  [FieldMetadataType.Numeric]: {
    label: 'Numeric',
    Icon: IconNumbers,
    exampleValue: 2000,
    category: 'Basic',
  },
  [FieldMetadataType.Number]: {
    label: 'Number',
    Icon: IconNumbers,
    exampleValue: 2000,
    category: 'Basic',
  },
  [FieldMetadataType.Link]: {
    label: 'Link',
    Icon: IconLink,
    exampleValue: { url: 'www.twenty.com', label: '' },
    category: 'Basic',
  },
  [FieldMetadataType.Links]: {
    label: 'Links',
    Icon: IconLink,
    exampleValue: { primaryLinkUrl: 'twenty.com', primaryLinkLabel: '' },
    category: 'Basic',
  },
  [FieldMetadataType.Boolean]: {
    label: 'True/False',
    Icon: IconCheck,
    exampleValue: true,
    category: 'Basic',
  },
  [FieldMetadataType.DateTime]: {
    label: 'Date and Time',
    Icon: IconCalendarTime,
    exampleValue: DEFAULT_DATE_VALUE.toISOString(),
    category: 'Basic',
  },
  [FieldMetadataType.Date]: {
    label: 'Date',
    Icon: IconCalendarEvent,
    exampleValue: DEFAULT_DATE_VALUE.toISOString(),
    category: 'Basic',
  },
  [FieldMetadataType.Select]: {
    label: 'Select',
    Icon: IconTag,
    category: 'Basic',
  },
  [FieldMetadataType.MultiSelect]: {
    label: 'Multi-select',
    Icon: IconTags,
    category: 'Basic',
  },
  [FieldMetadataType.Currency]: {
    label: 'Currency',
    Icon: IconCoins,
    exampleValue: { amountMicros: 2000000000, currencyCode: CurrencyCode.USD },
    category: 'Basic',
  },
  [FieldMetadataType.Relation]: {
    label: 'Relation',
    Icon: IconRelationManyToMany,
    category: 'Relation',
  },
  [FieldMetadataType.Email]: {
    label: 'Email',
    Icon: IconMail,
    category: 'Basic',
  },
  [FieldMetadataType.Emails]: {
    label: 'Emails',
    Icon: IconMail,
    exampleValue: { primaryEmail: 'john@twenty.com' },
    category: 'Basic',
  },
  [FieldMetadataType.Phone]: {
    label: 'Phone',
    Icon: IconPhone,
    exampleValue: '+1234-567-890',
    category: 'Basic',
  },
  [FieldMetadataType.Phones]: {
    label: 'Phones',
    Icon: IconPhone,
    exampleValue: {
      primaryPhoneNumber: '234-567-890',
      primaryPhoneCountryCode: '+1',
    },
    category: 'Basic',
  },
  [FieldMetadataType.Rating]: {
    label: 'Rating',
    Icon: IconTwentyStar,
    exampleValue: '3',
    category: 'Basic',
  },
  [FieldMetadataType.FullName]: {
    label: 'Full Name',
    Icon: IconUser,
    exampleValue: { firstName: 'John', lastName: 'Doe' },
    category: 'Advanced',
  },
  [FieldMetadataType.Address]: {
    label: 'Address',
    Icon: IconMap,
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
  },
  [FieldMetadataType.RawJson]: {
    label: 'JSON',
    Icon: IconJson,
    exampleValue: { key: 'value' },

    category: 'Basic',
  },
  [FieldMetadataType.RichText]: {
    label: 'Rich Text',
    Icon: IconFilePencil,
    exampleValue: { key: 'value' },
    category: 'Basic',
  },
  [FieldMetadataType.Actor]: {
    label: 'Actor',
    Icon: IconCreativeCommonsSa,
    category: 'Basic',
  },
} as const satisfies Record<
  SettingsSupportedFieldType,
  SettingsFieldTypeConfig
>;
