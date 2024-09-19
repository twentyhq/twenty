import {
  IconComponent,
  IllustrationIconArray,
  IllustrationIconCalendarEvent,
  IllustrationIconCalendarTime,
  IllustrationIconCurrency,
  IllustrationIconJson,
  IllustrationIconLink,
  IllustrationIconMail,
  IllustrationIconMap,
  IllustrationIconNumbers,
  IllustrationIconOneToMany,
  IllustrationIconPhone,
  IllustrationIconSetting,
  IllustrationIconStar,
  IllustrationIconTag,
  IllustrationIconTags,
  IllustrationIconText,
  IllustrationIconToggle,
  IllustrationIconUid,
  IllustrationIconUser,
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
    Icon: IllustrationIconUid,
    exampleValue: '00000000-0000-0000-0000-000000000000',
    category: 'Advanced',
  },
  [FieldMetadataType.Text]: {
    label: 'Text',
    Icon: IllustrationIconText,
    exampleValue:
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
    category: 'Basic',
  },
  [FieldMetadataType.Numeric]: {
    label: 'Numeric',
    Icon: IllustrationIconNumbers,
    exampleValue: 2000,
    category: 'Basic',
  },
  [FieldMetadataType.Number]: {
    label: 'Number',
    Icon: IllustrationIconNumbers,
    exampleValue: 2000,
    category: 'Basic',
  },
  [FieldMetadataType.Link]: {
    label: 'Link',
    Icon: IllustrationIconLink,
    exampleValue: { url: 'www.twenty.com', label: '' },
    category: 'Basic',
  },
  [FieldMetadataType.Links]: {
    label: 'Links',
    Icon: IllustrationIconLink,
    exampleValue: { primaryLinkUrl: 'twenty.com', primaryLinkLabel: '' },
    category: 'Basic',
  },
  [FieldMetadataType.Boolean]: {
    label: 'True/False',
    Icon: IllustrationIconToggle,
    exampleValue: true,
    category: 'Basic',
  },
  [FieldMetadataType.DateTime]: {
    label: 'Date and Time',
    Icon: IllustrationIconCalendarTime,
    exampleValue: DEFAULT_DATE_VALUE.toISOString(),
    category: 'Basic',
  },
  [FieldMetadataType.Date]: {
    label: 'Date',
    Icon: IllustrationIconCalendarEvent,
    exampleValue: DEFAULT_DATE_VALUE.toISOString(),
    category: 'Basic',
  },
  [FieldMetadataType.Select]: {
    label: 'Select',
    Icon: IllustrationIconTag,
    category: 'Basic',
  },
  [FieldMetadataType.MultiSelect]: {
    label: 'Multi-select',
    Icon: IllustrationIconTags,
    category: 'Basic',
  },
  [FieldMetadataType.Currency]: {
    label: 'Currency',
    Icon: IllustrationIconCurrency,
    exampleValue: { amountMicros: 2000000000, currencyCode: CurrencyCode.USD },
    category: 'Basic',
  },
  [FieldMetadataType.Relation]: {
    label: 'Relation',
    Icon: IllustrationIconOneToMany,
    category: 'Relation',
  },
  [FieldMetadataType.Email]: {
    label: 'Email',
    Icon: IllustrationIconMail,
    category: 'Basic',
  },
  [FieldMetadataType.Emails]: {
    label: 'Emails',
    Icon: IllustrationIconMail,
    exampleValue: { primaryEmail: 'john@twenty.com' },
    category: 'Basic',
  },
  [FieldMetadataType.Phone]: {
    label: 'Phone',
    Icon: IllustrationIconPhone,
    exampleValue: '+1234-567-890',
    category: 'Basic',
  },
  [FieldMetadataType.Phones]: {
    label: 'Phones',
    Icon: IllustrationIconPhone,
    exampleValue: {
      primaryPhoneNumber: '234-567-890',
      primaryPhoneCountryCode: '+1',
    },
    category: 'Basic',
  },
  [FieldMetadataType.Rating]: {
    label: 'Rating',
    Icon: IllustrationIconStar,
    exampleValue: '3',
    category: 'Basic',
  },
  [FieldMetadataType.FullName]: {
    label: 'Full Name',
    Icon: IllustrationIconUser,
    exampleValue: { firstName: 'John', lastName: 'Doe' },
    category: 'Advanced',
  },
  [FieldMetadataType.Address]: {
    label: 'Address',
    Icon: IllustrationIconMap,
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
    Icon: IllustrationIconJson,
    exampleValue: { key: 'value' },

    category: 'Basic',
  },
  [FieldMetadataType.RichText]: {
    label: 'Rich Text',
    Icon: IllustrationIconSetting,
    exampleValue: { key: 'value' },
    category: 'Basic',
  },
  [FieldMetadataType.Actor]: {
    label: 'Actor',
    Icon: IllustrationIconSetting,
    category: 'Basic',
  },
  [FieldMetadataType.Array]: {
    label: 'Array',
    Icon: IllustrationIconArray,
    category: 'Basic',
    exampleValue: ['value1', 'value2'],
  },
} as const satisfies Record<
  SettingsSupportedFieldType,
  SettingsFieldTypeConfig
>;
