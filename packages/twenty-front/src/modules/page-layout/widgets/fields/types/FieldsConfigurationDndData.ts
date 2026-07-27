import { type FieldsConfigurationFieldDragData } from '@/page-layout/widgets/fields/types/FieldsConfigurationFieldDragData';
import { type FieldsConfigurationFieldListEndDropData } from '@/page-layout/widgets/fields/types/FieldsConfigurationFieldListEndDropData';
import { type FieldsConfigurationGroupDragData } from '@/page-layout/widgets/fields/types/FieldsConfigurationGroupDragData';
import { type FieldsConfigurationGroupListEndDropData } from '@/page-layout/widgets/fields/types/FieldsConfigurationGroupListEndDropData';

export type FieldsConfigurationDndData =
  | FieldsConfigurationGroupDragData
  | FieldsConfigurationGroupListEndDropData
  | FieldsConfigurationFieldDragData
  | FieldsConfigurationFieldListEndDropData;
