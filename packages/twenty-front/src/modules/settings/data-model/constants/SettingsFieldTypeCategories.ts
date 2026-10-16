import { type SettingsFieldTypeCategoryType } from '@/settings/data-model/types/SettingsFieldTypeCategoryType';

// These values are stable category keys; the selector renders their translated labels.
// oxlint-disable lingui/no-unlocalized-strings
export const SETTINGS_FIELD_TYPE_CATEGORIES: SettingsFieldTypeCategoryType[] = [
  'Basic',
  'Relation',
  'Advanced',
];
// oxlint-enable lingui/no-unlocalized-strings
