import { type SettingsFieldTypeCategoryType } from '@/settings/data-model/types/SettingsFieldTypeCategoryType';

export const SETTINGS_FIELD_TYPE_CATEGORY_DESCRIPTIONS: Record<
  SettingsFieldTypeCategoryType,
  string
> = {
  Basic: 'All the basic field types you need to start',
  Advanced: 'More advanced fields for advanced projects',
  Relation: 'Create a relation with other objects',
};
