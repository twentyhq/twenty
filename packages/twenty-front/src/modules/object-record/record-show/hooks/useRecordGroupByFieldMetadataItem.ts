import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';

export const useRecordGroupByFieldMetadataItem = () : | FieldMetadataItem | undefined => {
  const { currentView } = useGetCurrentViewOnly();
  const { fieldMetadataItem: groupByFieldMetadataItem } = useFieldMetadataItemById(currentView?.mainGroupByFieldMetadataId ?? '');

  return groupByFieldMetadataItem;
};
