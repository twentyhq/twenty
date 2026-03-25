import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export type FieldsWidgetGroupField = {
  fieldMetadataItem: FieldMetadataItem;
  position: number;
  isVisible: boolean;
  globalIndex: number;
  viewFieldId?: string;
};

export type FieldsWidgetGroup = {
  id: string;
  name: string;
  position: number;
  isVisible: boolean;
  fields: FieldsWidgetGroupField[];
};
