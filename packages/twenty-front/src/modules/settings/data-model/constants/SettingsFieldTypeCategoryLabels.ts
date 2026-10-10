import { type SettingsFieldTypeCategoryType } from '@/settings/data-model/types/SettingsFieldTypeCategoryType';
import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

export const SETTINGS_FIELD_TYPE_CATEGORY_LABELS: Record<
  SettingsFieldTypeCategoryType,
  MessageDescriptor
> = {
  Basic: msg`Basic`,
  Advanced: msg`Advanced`,
  Relation: msg`Relation`,
};
