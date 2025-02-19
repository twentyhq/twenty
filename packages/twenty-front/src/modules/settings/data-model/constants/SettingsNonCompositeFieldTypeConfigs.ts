import {
  IconComponent,
  IllustrationIconArray,
  IllustrationIconCalendarEvent,
  IllustrationIconCalendarTime,
  IllustrationIconJson,
  IllustrationIconNumbers,
  IllustrationIconOneToMany,
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
    [FieldMetadataType.UUID]: {
      label: 'Unique ID',
      Icon: IllustrationIconUid,
      exampleValue: '00000000-0000-0000-0000-000000000000',
      category: 'Advanced',
    } as const satisfies SettingsFieldTypeConfig<FieldUUidValue>,
    [FieldMetadataType.TEXT]: {
      label: 'Text',
      Icon: IllustrationIconText,
      exampleValue:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldTextValue>,
    [FieldMetadataType.NUMERIC]: {
      label: 'Numeric',
      Icon: IllustrationIconNumbers,
      exampleValue: 2000,
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldNumberValue>,
    [FieldMetadataType.NUMBER]: {
      label: 'Number',
      Icon: IllustrationIconNumbers,
      exampleValue: 2000,
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldNumberValue>,
    [FieldMetadataType.BOOLEAN]: {
      label: 'True/False',
      Icon: IllustrationIconToggle,
      exampleValue: true,
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldBooleanValue>,
    [FieldMetadataType.DATE_TIME]: {
      label: 'Date and Time',
      Icon: IllustrationIconCalendarTime,
      exampleValue: DEFAULT_DATE_VALUE.toISOString(),
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldDateTimeValue>,
    [FieldMetadataType.DATE]: {
      label: 'Date',
      Icon: IllustrationIconCalendarEvent,
      exampleValue: DEFAULT_DATE_VALUE.toISOString(),
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldDateValue>,
    [FieldMetadataType.SELECT]: {
      label: 'Select',
      Icon: IllustrationIconTag,
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldSelectValue>,
    [FieldMetadataType.MULTI_SELECT]: {
      label: 'Multi-select',
      Icon: IllustrationIconTags,
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldMultiSelectValue>,
    [FieldMetadataType.RELATION]: {
      label: 'Relation',
      Icon: IllustrationIconOneToMany,
      category: 'Relation',
    } as const satisfies SettingsFieldTypeConfig<FieldRelationValue<any>>,
    [FieldMetadataType.RATING]: {
      label: 'Rating',
      Icon: IllustrationIconStar,
      exampleValue: 'RATING_3',
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldRatingValue>,
    [FieldMetadataType.RAW_JSON]: {
      label: 'JSON',
      Icon: IllustrationIconJson,
      exampleValue: { key: 'value' },
      category: 'Advanced',
    } as const satisfies SettingsFieldTypeConfig<FieldJsonValue>,
    [FieldMetadataType.ARRAY]: {
      label: 'Array',
      Icon: IllustrationIconArray,
      category: 'Advanced',
      exampleValue: ['value1', 'value2'],
    } as const satisfies SettingsFieldTypeConfig<FieldArrayValue>,
  };
