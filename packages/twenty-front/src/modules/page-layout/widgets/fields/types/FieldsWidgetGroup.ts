import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ConditionalDisplay } from 'twenty-shared/types';

export type FieldsWidgetGroupField = {
  fieldMetadataItem: FieldMetadataItem;
  position: number;
  isVisible: boolean;
  globalIndex: number;
  viewFieldId?: string;
  conditionalDisplay?: ConditionalDisplay | null;
};

export type FieldsWidgetGroup = {
  id: string;
  name: string;
  position: number;
  isVisible: boolean;
  fields: FieldsWidgetGroupField[];
};
