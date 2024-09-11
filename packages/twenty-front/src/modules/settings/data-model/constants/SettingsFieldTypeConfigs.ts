import {
  IconComponent,
  IconIllustrationCalendarEvent,
  IconIllustrationCalendarTime,
  IconIllustrationCurrency,
  IconIllustrationJson,
  IconIllustrationLink,
  IconIllustrationMail,
  IconIllustrationMap,
  IconIllustrationNumbers,
  IconIllustrationOneToMany,
  IconIllustrationPhone,
  IconIllustrationSetting,
  IconIllustrationStar,
  IconIllustrationTag,
  IconIllustrationTags,
  IconIllustrationText,
  IconIllustrationToggle,
  IconIllustrationUid,
  IconIllustrationUser,
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
    Icon: IconIllustrationUid,
    exampleValue: '00000000-0000-0000-0000-000000000000',
    category: 'Advanced',
  },
  [FieldMetadataType.Text]: {
    label: 'Text',
    Icon: IconIllustrationText,
    exampleValue:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
    category: 'Basic',
  },
  [FieldMetadataType.Numeric]: {
    label: 'Numeric',
    Icon: IconIllustrationNumbers,
    exampleValue: 2000,
    category: 'Basic',
  },
  [FieldMetadataType.Number]: {
    label: 'Number',
    Icon: IconIllustrationNumbers,
    exampleValue: 2000,
    category: 'Basic',
  },
  [FieldMetadataType.Link]: {
    label: 'Link',
    Icon: IconIllustrationLink,
    exampleValue: { url: 'www.twenty.com', label: '' },
    category: 'Basic',
  },
  [FieldMetadataType.Links]: {
    label: 'Links',
    Icon: IconIllustrationLink,
    exampleValue: { primaryLinkUrl: 'twenty.com', primaryLinkLabel: '' },
    category: 'Basic',
  },
  [FieldMetadataType.Boolean]: {
    label: 'True/False',
    Icon: IconIllustrationToggle,
    exampleValue: true,
    category: 'Basic',
  },
  [FieldMetadataType.DateTime]: {
    label: 'Date and Time',
    Icon: IconIllustrationCalendarTime,
    exampleValue: DEFAULT_DATE_VALUE.toISOString(),
    category: 'Basic',
  },
  [FieldMetadataType.Date]: {
    label: 'Date',
    Icon: IconIllustrationCalendarEvent,
    exampleValue: DEFAULT_DATE_VALUE.toISOString(),
    category: 'Basic',
  },
  [FieldMetadataType.Select]: {
    label: 'Select',
    Icon: IconIllustrationTag,
    category: 'Basic',
  },
  [FieldMetadataType.MultiSelect]: {
    label: 'Multi-select',
    Icon: IconIllustrationTags,
    category: 'Basic',
  },
  [FieldMetadataType.Currency]: {
    label: 'Currency',
    Icon: IconIllustrationCurrency,
    exampleValue: { amountMicros: 2000000000, currencyCode: CurrencyCode.USD },
    category: 'Basic',
  },
  [FieldMetadataType.Relation]: {
    label: 'Relation',
    Icon: IconIllustrationOneToMany,
    category: 'Relation',
  },
  [FieldMetadataType.Email]: {
    label: 'Email',
    Icon: IconIllustrationMail,
    category: 'Basic',
  },
  [FieldMetadataType.Emails]: {
    label: 'Emails',
    Icon: IconIllustrationMail,
    exampleValue: { primaryEmail: 'john@twenty.com' },
    category: 'Basic',
  },
  [FieldMetadataType.Phone]: {
    label: 'Phone',
    Icon: IconIllustrationPhone,
    exampleValue: '+1234-567-890',
    category: 'Basic',
  },
  [FieldMetadataType.Rating]: {
    label: 'Rating',
    Icon: IconIllustrationStar,
    exampleValue: '3',
    category: 'Basic',
  },
  [FieldMetadataType.FullName]: {
    label: 'Full Name',
    Icon: IconIllustrationUser,
    exampleValue: { firstName: 'John', lastName: 'Doe' },
    category: 'Advanced',
  },
  [FieldMetadataType.Address]: {
    label: 'Address',
    Icon: IconIllustrationMap,
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
    Icon: IconIllustrationJson,
    exampleValue: { key: 'value' },

    category: 'Basic',
  },
  [FieldMetadataType.RichText]: {
    label: 'Rich Text',
    Icon: IconIllustrationSetting,
    exampleValue: { key: 'value' },
    category: 'Basic',
  },
  [FieldMetadataType.Actor]: {
    label: 'Actor',
    Icon: IconIllustrationSetting,
    category: 'Basic',
  },
} as const satisfies Record<
  SettingsSupportedFieldType,
  SettingsFieldTypeConfig
>;
