import { SettingsFieldTypeCategoryType } from '@/settings/data-model/types/SettingsFieldTypeCategoryType';

export const SETTINGS_FIELD_TYPE_CATEGORY_DESCRIPTIONS: Record<
  SettingsFieldTypeCategoryType,
  string
> = {
  Basic: 'Todos os tipos de campos básicos que você precisa para começar',
  Advanced: 'Campos mais avançados para projetos avançados',
  Relation: 'Crie uma relação com outro objeto',
};
