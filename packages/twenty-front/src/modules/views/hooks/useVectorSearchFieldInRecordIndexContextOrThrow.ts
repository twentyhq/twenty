import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { SEARCH_VECTOR_FIELD_NAME } from '../constants/ViewFieldConstants';

export const useVectorSearchFieldInRecordIndexContextOrThrow = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const vectorSearchField = objectMetadataItem.fields.find(
    (field) =>
      field.type === 'TS_VECTOR' && field.name === SEARCH_VECTOR_FIELD_NAME,
  );

  return { vectorSearchField };
};
