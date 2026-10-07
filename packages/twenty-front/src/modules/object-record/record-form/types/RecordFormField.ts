import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';

export type RecordFormField<
  TFieldMetadataItem extends Pick<FieldMetadataItem, 'id'> = FieldMetadataItem,
> = {
  fieldMetadataItem: TFieldMetadataItem;
  widgets: Pick<PageLayoutWidget, 'id' | 'isActive'>[];
  isVisible: boolean;
};
