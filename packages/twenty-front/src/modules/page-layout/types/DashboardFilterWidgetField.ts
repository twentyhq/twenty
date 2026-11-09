import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export type DashboardFilterWidgetField = Pick<
  FieldMetadataItem,
  'id' | 'name' | 'type' | 'label' | 'icon' | 'isActive'
>;
