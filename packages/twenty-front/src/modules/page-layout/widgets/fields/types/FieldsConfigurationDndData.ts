import { type FieldsConfigurationFieldDragData } from '@/page-layout/widgets/fields/types/FieldsConfigurationFieldDragData';
import { type FieldsConfigurationGroupDragData } from '@/page-layout/widgets/fields/types/FieldsConfigurationGroupDragData';

export type FieldsConfigurationDndData =
  | FieldsConfigurationGroupDragData
  | FieldsConfigurationFieldDragData;
