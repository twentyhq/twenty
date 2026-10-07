import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export type RecordFormField<
  TFieldMetadataItem extends Pick<FieldMetadataItem, 'id'> = FieldMetadataItem,
> = {
  widgetId: string;
  fieldMetadataItem: TFieldMetadataItem;
  isVisible: boolean;
};
