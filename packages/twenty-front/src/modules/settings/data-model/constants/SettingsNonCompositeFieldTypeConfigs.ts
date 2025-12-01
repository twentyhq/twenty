import {
  type FieldArrayValue,
  type FieldBooleanValue,
  type FieldDateTimeValue,
  type FieldDateValue,
  type FieldJsonValue,
  type FieldMultiSelectValue,
  type FieldNumberValue,
  type FieldRelationValue,
  type FieldSelectValue,
  type FieldTextValue,
  type FieldUUidValue,
} from '@/object-record/record-field/ui/types/FieldMetadata';
import { DEFAULT_DATE_VALUE } from '@/settings/data-model/constants/DefaultDateValue';
import { type SettingsFieldTypeCategoryType } from '@/settings/data-model/types/SettingsFieldTypeCategoryType';
import { type SettingsNonCompositeFieldType } from '@/settings/data-model/types/SettingsNonCompositeFieldType';
import { type FieldRatingValue } from 'twenty-shared/types';
import {
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
  type IconComponent,
} from 'twenty-ui/display';
import { FieldMetadataType } from '~/generated-metadata/graphql';

DEFAULT_DATE_VALUE.setFullYear(DEFAULT_DATE_VALUE.getFullYear() + 2);

export type SettingsFieldTypeConfig<T> = {
  label: string;
  Icon: IconComponent;
  exampleValues?: [T, T, T];
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
      exampleValues: [
        '00000000-0000-4000-8000-000000000000',
        '00000000-0000-4000-8000-000000000001',
        '00000000-0000-4000-8000-000000000003',
      ],
      category: 'Advanced',
    } as const satisfies SettingsFieldTypeConfig<FieldUUidValue>,
    [FieldMetadataType.TEXT]: {
      label: 'Text',
      Icon: IllustrationIconText,
      exampleValues: [
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
        'Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
        'Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
      ],
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldTextValue>,
    [FieldMetadataType.NUMBER]: {
      label: 'Number',
      Icon: IllustrationIconNumbers,
      exampleValues: [2000, 3000, 4000],
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldNumberValue>,
    [FieldMetadataType.BOOLEAN]: {
      label: 'True/False',
      Icon: IllustrationIconToggle,
      exampleValues: [true, false, true],
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldBooleanValue>,
    [FieldMetadataType.DATE_TIME]: {
      label: 'Date and Time',
      Icon: IllustrationIconCalendarTime,
      exampleValues: [
        DEFAULT_DATE_VALUE.toISOString(),
        '2025-06-10T12:01:00.000Z',
        '2018-07-14T12:02:00.000Z',
      ],
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldDateTimeValue>,
    [FieldMetadataType.DATE]: {
      label: 'Date',
      Icon: IllustrationIconCalendarEvent,
      exampleValues: [
        DEFAULT_DATE_VALUE.toISOString(),
        '2025-06-10T00:00:00.000Z',
        '2018-07-14T00:00:00.000Z',
      ],
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
    [FieldMetadataType.MORPH_RELATION]: {
      label: 'Morph Relation',
      Icon: IllustrationIconOneToMany,
      category: 'Relation',
    } as const satisfies SettingsFieldTypeConfig<FieldRelationValue<any>>,
    [FieldMetadataType.RATING]: {
      label: 'Rating',
      Icon: IllustrationIconStar,
      exampleValues: ['RATING_3', 'RATING_4', 'RATING_5'],
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldRatingValue>,
    [FieldMetadataType.RAW_JSON]: {
      label: 'JSON',
      Icon: IllustrationIconJson,
      exampleValues: [{ key: 'value1' }, { key: 'value2', key2: 'value2' }, {}],
      category: 'Advanced',
    } as const satisfies SettingsFieldTypeConfig<FieldJsonValue>,
    [FieldMetadataType.ARRAY]: {
      label: 'Array',
      Icon: IllustrationIconArray,
      category: 'Advanced',
      exampleValues: [['value1', 'value2'], ['value3'], []],
    } as const satisfies SettingsFieldTypeConfig<FieldArrayValue>,
  };
