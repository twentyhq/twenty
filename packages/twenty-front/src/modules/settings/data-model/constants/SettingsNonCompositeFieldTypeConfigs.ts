import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';
import {
  type FieldArrayValue,
  type FieldBooleanValue,
  type FieldDateTimeValue,
  type FieldDateValue,
  type FieldFilesValue,
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
import { FILE_CATEGORIES, type FieldRatingValue } from 'twenty-shared/types';
import {
  IllustrationIconArray,
  IllustrationIconCalendarEvent,
  IllustrationIconCalendarTime,
  IllustrationIconFile,
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
} from 'twenty-ui/icon';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { doNotTranslate } from 'twenty-shared/i18n';

DEFAULT_DATE_VALUE.setFullYear(DEFAULT_DATE_VALUE.getFullYear() + 2);

export type SettingsFieldTypeConfig<T> = {
  label: MessageDescriptor;
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
      label: msg({ message: `Unique ID`, context: 'Field type' }),
      Icon: IllustrationIconUid,
      exampleValues: doNotTranslate([
        '00000000-0000-4000-8000-000000000000',
        '00000000-0000-4000-8000-000000000001',
        '00000000-0000-4000-8000-000000000003',
      ]),
      category: 'Advanced',
    } as const satisfies SettingsFieldTypeConfig<FieldUUidValue>,
    [FieldMetadataType.TEXT]: {
      label: msg({ message: `Text`, context: 'Field type' }),
      Icon: IllustrationIconText,
      exampleValues: doNotTranslate([
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
        'Vestibulum magna enim, dapibus non enim in, lacinia faucibus nunc. Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
        'Sed interdum ante sed felis facilisis, eget ultricies neque molestie. Mauris auctor, justo eu volutpat cursus, libero erat tempus nulla, non sodales lorem lacus a est.',
      ]),
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldTextValue>,
    [FieldMetadataType.NUMBER]: {
      label: msg({ message: `Number`, context: 'Field type' }),
      Icon: IllustrationIconNumbers,
      exampleValues: doNotTranslate([2000, 3000, 4000]),
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldNumberValue>,
    [FieldMetadataType.BOOLEAN]: {
      label: msg({ message: `True/False`, context: 'Field type' }),
      Icon: IllustrationIconToggle,
      exampleValues: doNotTranslate([true, false, true]),
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldBooleanValue>,
    [FieldMetadataType.DATE_TIME]: {
      label: msg({ message: `Date and Time`, context: 'Field type' }),
      Icon: IllustrationIconCalendarTime,
      exampleValues: doNotTranslate([
        DEFAULT_DATE_VALUE.toISOString(),
        '2025-06-10T12:01:00.000Z',
        '2018-07-14T12:02:00.000Z',
      ]),
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldDateTimeValue>,
    [FieldMetadataType.DATE]: {
      label: msg({ message: `Date`, context: 'Field type' }),
      Icon: IllustrationIconCalendarEvent,
      exampleValues: doNotTranslate([
        DEFAULT_DATE_VALUE.toISOString(),
        '2025-06-10T00:00:00.000Z',
        '2018-07-14T00:00:00.000Z',
      ]),
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldDateValue>,
    [FieldMetadataType.SELECT]: {
      label: msg({ message: `Select`, context: 'Field type' }),
      Icon: IllustrationIconTag,
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldSelectValue>,
    [FieldMetadataType.MULTI_SELECT]: {
      label: msg({ message: `Multi-select`, context: 'Field type' }),
      Icon: IllustrationIconTags,
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldMultiSelectValue>,
    [FieldMetadataType.RELATION]: {
      label: msg({ message: `Relation`, context: 'Field type' }),
      Icon: IllustrationIconOneToMany,
      category: 'Relation',
    } as const satisfies SettingsFieldTypeConfig<FieldRelationValue<any>>,
    [FieldMetadataType.MORPH_RELATION]: {
      label: msg({ message: `Morph Relation`, context: 'Field type' }),
      Icon: IllustrationIconOneToMany,
      category: 'Relation',
    } as const satisfies SettingsFieldTypeConfig<FieldRelationValue<any>>,
    [FieldMetadataType.RATING]: {
      label: msg({ message: `Rating`, context: 'Field type' }),
      Icon: IllustrationIconStar,
      exampleValues: doNotTranslate(['RATING_3', 'RATING_4', 'RATING_5']),
      category: 'Basic',
    } as const satisfies SettingsFieldTypeConfig<FieldRatingValue>,
    [FieldMetadataType.RAW_JSON]: {
      label: msg({ message: `JSON`, context: 'Field type' }),
      Icon: IllustrationIconJson,
      exampleValues: doNotTranslate([
        { key: 'value1' },
        { key: 'value2', key2: 'value2' },
        {},
      ]),
      category: 'Advanced',
    } as const satisfies SettingsFieldTypeConfig<FieldJsonValue>,
    [FieldMetadataType.ARRAY]: {
      label: msg({ message: `Array`, context: 'Field type' }),
      Icon: IllustrationIconArray,
      category: 'Advanced',
      exampleValues: doNotTranslate([['value1', 'value2'], ['value3'], []]),
    } as const satisfies SettingsFieldTypeConfig<FieldArrayValue>,
    [FieldMetadataType.FILES]: {
      label: msg({ message: `Files`, context: 'Field type' }),
      Icon: IllustrationIconFile,
      category: 'Basic',
      exampleValues: doNotTranslate([
        [
          {
            fileId: 'file-1',
            label: 'Document.pdf',
            fileCategory: FILE_CATEGORIES.TEXT_DOCUMENT,
          },
          {
            fileId: 'file-2',
            label: 'Image.png',
            fileCategory: FILE_CATEGORIES.IMAGE,
          },
        ],
        [
          {
            fileId: 'file-3',
            label: 'Report.xlsx',
            fileCategory: FILE_CATEGORIES.SPREADSHEET,
          },
        ],
        [],
      ]),
    } as const satisfies SettingsFieldTypeConfig<FieldFilesValue[]>,
  };
