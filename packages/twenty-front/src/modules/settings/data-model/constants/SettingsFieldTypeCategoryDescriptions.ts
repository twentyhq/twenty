import { type SettingsFieldTypeCategoryType } from '@/settings/data-model/types/SettingsFieldTypeCategoryType';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const SETTINGS_FIELD_TYPE_CATEGORY_DESCRIPTIONS: Record<
  SettingsFieldTypeCategoryType,
  MessageDescriptor
> = {
  Basic: msg`All the basic field types you need to start`,
  Advanced: msg`More advanced fields for advanced projects`,
  Relation: msg`Create a relation with other objects`,
};
