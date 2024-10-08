import { CompositeFieldType } from '@/settings/data-model/types/CompositeFieldType';
import { SettingsFieldType } from '@/settings/data-model/types/SettingsFieldType';
import { PickLiteral } from '~/types/PickLiteral';

export type SettingsCompositeFieldType = PickLiteral<
  SettingsFieldType,
  CompositeFieldType
>;
