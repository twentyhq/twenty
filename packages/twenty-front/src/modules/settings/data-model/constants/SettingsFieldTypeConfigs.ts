import {
  IconCalendarEvent,
  IconCalendarTime,
  IconCheck,
  IconCoins,
  IconComponent,
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
  defaultValue?: unknown;
};

export const SETTINGS_FIELD_TYPE_CONFIGS: Record<
  SettingsSupportedFieldType,
  SettingsFieldTypeConfig
> = {
  [FieldMetadataType.Uuid]: {
    label: 'Unique ID',
    Icon: IconKey,
    defaultValue: '00000000-0000-0000-0000-000000000000',
  },
  [FieldMetadataType.Text]: {
    label: 'Text',
    Icon: IconTextSize,
    defaultValue:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
  },
  [FieldMetadataType.Numeric]: {
    label: 'Numeric',
    Icon: IconNumbers,
    defaultValue: 2000,
  },
  [FieldMetadataType.Number]: {
    label: 'Number',
    Icon: IconNumbers,
    defaultValue: 2000,
  },
  [FieldMetadataType.Link]: {
    label: 'Link',
    Icon: IconLink,
    defaultValue: { url: 'www.twenty.com', label: '' },
  },
  [FieldMetadataType.Boolean]: {
    label: 'True/False',
    Icon: IconCheck,
    defaultValue: true,
  },
  [FieldMetadataType.DateTime]: {
    label: 'Date and Time',
    Icon: IconCalendarTime,
    defaultValue: DEFAULT_DATE_VALUE.toISOString(),
  },
  [FieldMetadataType.Date]: {
    label: 'Date',
    Icon: IconCalendarEvent,
    defaultValue: DEFAULT_DATE_VALUE.toISOString(),
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
    defaultValue: { amountMicros: 2000000000, currencyCode: CurrencyCode.USD },
  },
  [FieldMetadataType.Relation]: {
    label: 'Relation',
    Icon: IconRelationManyToMany,
  },
  [FieldMetadataType.Email]: { label: 'Email', Icon: IconMail },
  [FieldMetadataType.Phone]: {
    label: 'Phone',
    Icon: IconPhone,
    defaultValue: '+1234-567-890',
  },
  [FieldMetadataType.Probability]: {
    label: 'Rating',
    Icon: IconTwentyStar,
    defaultValue: '3',
  },
  [FieldMetadataType.Rating]: {
    label: 'Rating',
    Icon: IconTwentyStar,
    defaultValue: '3',
  },
  [FieldMetadataType.FullName]: {
    label: 'Full Name',
    Icon: IconUser,
    defaultValue: { firstName: 'John', lastName: 'Doe' },
  },
  [FieldMetadataType.Address]: {
    label: 'Address',
    Icon: IconMap,
    defaultValue: {
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
    defaultValue: `{ "key": "value" }`,
  },
};
