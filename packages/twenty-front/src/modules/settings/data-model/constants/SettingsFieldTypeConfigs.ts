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
import { SettingsSupportedFieldType } from '@/settings/data-model/types/SettingsSupportedFieldType';
import { FieldMetadataType } from '~/generated-metadata/graphql';

DEFAULT_DATE_VALUE.setFullYear(DEFAULT_DATE_VALUE.getFullYear() + 2);

export type SettingsFieldTypeConfig = {
  label: string;
  Icon: IconComponent;
  exampleValue?: unknown;
};

export const SETTINGS_FIELD_TYPE_CONFIGS = {
  [FieldMetadataType.Uuid]: {
    label: 'Unique ID',
    Icon: IconKey,
    exampleValue: '00000000-0000-0000-0000-000000000000',
  },
  [FieldMetadataType.Text]: {
    label: 'Text',
    Icon: IconTextSize,
    exampleValue:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
  },
  [FieldMetadataType.Numeric]: {
    label: 'Numeric',
    Icon: IconNumbers,
    exampleValue: 2000,
  },
  [FieldMetadataType.Number]: {
    label: 'Number',
    Icon: IconNumbers,
    exampleValue: 2000,
  },
  [FieldMetadataType.Link]: {
    label: 'Link',
    Icon: IconLink,
    exampleValue: { url: 'www.twenty.com', label: '' },
  },
  [FieldMetadataType.Links]: {
    label: 'Links',
    Icon: IconLink,
    exampleValue: { primaryLinkUrl: 'twenty.com', primaryLinkLabel: '' },
  },
  [FieldMetadataType.Boolean]: {
    label: 'True/False',
    Icon: IconCheck,
    exampleValue: true,
  },
  [FieldMetadataType.DateTime]: {
    label: 'Date and Time',
    Icon: IconCalendarTime,
    exampleValue: DEFAULT_DATE_VALUE.toISOString(),
  },
  [FieldMetadataType.Date]: {
    label: 'Date',
    Icon: IconCalendarEvent,
    exampleValue: DEFAULT_DATE_VALUE.toISOString(),
  },
  [FieldMetadataType.Select]: {
    label: 'Select',
    Icon: IconTag,
  },
  [FieldMetadataType.MultiSelect]: {
    label: 'Multi-select',
    Icon: IconTags,
  },
  [FieldMetadataType.Currency]: {
    label: 'Currency',
    Icon: IconCoins,
    exampleValue: { amountMicros: 2000000000, currencyCode: CurrencyCode.USD },
  },
  [FieldMetadataType.Relation]: {
    label: 'Relation',
    Icon: IconRelationManyToMany,
  },
  [FieldMetadataType.Email]: { label: 'Email', Icon: IconMail },
  [FieldMetadataType.Phone]: {
    label: 'Phone',
    Icon: IconPhone,
    exampleValue: '+1234-567-890',
  },
  [FieldMetadataType.Rating]: {
    label: 'Rating',
    Icon: IconTwentyStar,
    exampleValue: '3',
  },
  [FieldMetadataType.FullName]: {
    label: 'Full Name',
    Icon: IconUser,
    exampleValue: { firstName: 'John', lastName: 'Doe' },
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
  },
  [FieldMetadataType.RawJson]: {
    label: 'JSON',
    Icon: IconJson,
    exampleValue: { key: 'value' },
  },
  [FieldMetadataType.RichText]: {
    label: 'Rich Text',
    Icon: IconFilePencil,
    exampleValue: { key: 'value' },
  },
  [FieldMetadataType.Actor]: {
    label: 'Actor',
    Icon: IconCreativeCommonsSa,
  },
} as const satisfies Record<
  SettingsSupportedFieldType,
  SettingsFieldTypeConfig
>;
