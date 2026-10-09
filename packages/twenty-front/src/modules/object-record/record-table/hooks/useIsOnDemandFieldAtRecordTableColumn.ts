import { getIsOnDemandFieldEnabled } from '@/object-record/record-field/on-demand/utils/getIsOnDemandFieldEnabled';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { isDefined } from 'twenty-shared/utils';

export const useIsOnDemandFieldAtRecordTableColumn = (column?: number) => {
  const { visibleRecordFields } = useRecordTableContextOrThrow();
  const { fieldMetadataItemByFieldMetadataItemId, isOnDemandFieldsEnabled } =
    useRecordIndexContextOrThrow();

  const recordField = isDefined(column)
    ? visibleRecordFields[column]
    : undefined;
  const fieldMetadataItem = isDefined(recordField)
    ? fieldMetadataItemByFieldMetadataItemId[recordField.fieldMetadataItemId]
    : undefined;

  return getIsOnDemandFieldEnabled({
    isOnDemandFieldsEnabled,
    fieldMetadataItem,
  });
};
