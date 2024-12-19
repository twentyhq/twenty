import {
  IconComponent,
  IllustrationIconArray,
  IllustrationIconCalendarEvent,
  IllustrationIconCalendarTime,
  IllustrationIconJson,
  IllustrationIconNumbers,
  IllustrationIconOneToMany,
  IllustrationIconSetting,
  IllustrationIconStar,
  IllustrationIconTag,
  IllustrationIconTags,
  IllustrationIconText,
  IllustrationIconToggle,
  IllustrationIconUid,
} from 'twenty-ui';

import {
  FieldArrayValue,
  FieldBooleanValue,
  FieldDateTimeValue,
  FieldDateValue,
  FieldJsonValue,
  FieldMultiSelectValue,
  FieldNumberValue,
  FieldRatingValue,
  FieldRelationValue,
  FieldRichTextValue,
  FieldSelectValue,
  FieldTextValue,
  FieldUUidValue,
} from '@/object-record/record-field/types/FieldMetadata';
import { DEFAULT_DATE_VALUE } from '@/settings/data-model/constants/DefaultDateValue';
import { SettingsFieldTypeCategoryType } from '@/settings/data-model/types/SettingsFieldTypeCategoryType';
import { SettingsNonCompositeFieldType } from '@/settings/data-model/types/SettingsNonCompositeFieldType';
import { FieldMetadataType } from '~/generated-metadata/graphql';

DEFAULT_DATE_VALUE.setFullYear(DEFAULT_DATE_VALUE.getFullYear() + 2);

export type SettingsFieldTypeConfig<T> = {
  label: string;
  Icon: IconComponent;
  exampleValue?: T;
  category: SettingsFieldTypeCategoryType;
};

type SettingsNonCompositeFieldTypeConfigArray = Record<
  SettingsNonCompositeFieldType,
  SettingsFieldTypeConfig<any>
>;

// TODO: can we derive this from backend definitions ?
export const SETTINGS_NON_COMPOSITE_FIELD_TYPE_CONFIGS: SettingsNonCompositeFieldTypeConfigArray =
  {
    [FieldMetadataType.Uuid]: {
      label: 'Unique ID',
      Icon: IllustrationIconUid,
      exampleValue: '00000000-0000-0000-0000-000000000000',
      category: 'Advanced',
    } as const satisfies SettingsFieldTypeConfig<FieldUUidValue>,
    [FieldMetadataType.Text]: {
      label: 'Text',
      Icon: IllustrationIconText,
      exampleValue:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldTextValue>,
    [FieldMetadataType.Numeric]: {
      label: 'Numeric',
      Icon: IllustrationIconNumbers,
      exampleValue: 2000,
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldNumberValue>,
    [FieldMetadataType.Number]: {
      label: 'Number',
      Icon: IllustrationIconNumbers,
      exampleValue: 2000,
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldNumberValue>,
    [FieldMetadataType.Boolean]: {
      label: 'True/False',
      Icon: IllustrationIconToggle,
      exampleValue: true,
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldBooleanValue>,
    [FieldMetadataType.DateTime]: {
      label: 'Date and Time',
      Icon: IllustrationIconCalendarTime,
      exampleValue: DEFAULT_DATE_VALUE.toISOString(),
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldDateTimeValue>,
    [FieldMetadataType.Date]: {
      label: 'Date',
      Icon: IllustrationIconCalendarEvent,
      exampleValue: DEFAULT_DATE_VALUE.toISOString(),
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldDateValue>,
    [FieldMetadataType.Select]: {
      label: 'Select',
      Icon: IllustrationIconTag,
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldSelectValue>,
    [FieldMetadataType.MultiSelect]: {
      label: 'Multi-select',
      Icon: IllustrationIconTags,
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldMultiSelectValue>,
    [FieldMetadataType.Relation]: {
      label: 'Relation',
      Icon: IllustrationIconOneToMany,
      category: 'Relation',
    } as const satisfies SettingsFieldTypeConfig<FieldRelationValue<any>>,
    [FieldMetadataType.Rating]: {
      label: 'Rating',
      Icon: IllustrationIconStar,
      exampleValue: 'RATING_3',
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldRatingValue>,
    [FieldMetadataType.RawJson]: {
      label: 'JSON',
      Icon: IllustrationIconJson,
      exampleValue: { key: 'value' },
      category: 'Advanced',
    } as const satisfies SettingsFieldTypeConfig<FieldJsonValue>,
    [FieldMetadataType.RichText]: {
      label: 'Rich Text',
      Icon: IllustrationIconSetting,
      exampleValue: "{ key: 'value' }",
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldRichTextValue>,
    [FieldMetadataType.Array]: {
      label: 'Array',
      Icon: IllustrationIconArray,
      category: 'Advanced',
      exampleValue: ['value1', 'value2'],
    } as const satisfies SettingsFieldTypeConfig<FieldArrayValue>,
  };
