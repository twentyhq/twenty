import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { EXPORT_TABLE_DATA_DEFAULT_PAGE_SIZE } from '@/object-record/object-options-dropdown/constants/ExportTableDataDefaultPageSize';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { ViewType } from '@/views/types/ViewType';
import { isDefined } from 'twenty-shared/utils';

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const percentage = (part: number, whole: number): number => {
  return Math.round((part / whole) * 100);
};

export type UseRecordDataOptions = {
  delayMs: number;
  maximumRequests?: number;
  objectMetadataItem: ObjectMetadataItem;
  pageSize?: number;
  recordIndexId: string;
  callback: (
    rows: ObjectRecord[],
    columns: Pick<
      ColumnDefinition<FieldMetadata>,
      'label' | 'type' | 'metadata'
    >[],
  ) => void | Promise<void>;
  viewType?: ViewType;
};

export const useRecordIndexLazyFetchRecords = ({
  objectMetadataItem,
  delayMs,
  maximumRequests = 100,
  pageSize = EXPORT_TABLE_DATA_DEFAULT_PAGE_SIZE,
  recordIndexId,
  callback,
  viewType = ViewType.Table,
}: UseRecordDataOptions) => {
  const { hiddenBoardFields } = useObjectOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const recordGroupFieldMetadata = useRecoilComponentValue(
    recordIndexGroupFieldMetadataItemComponentState,
    recordIndexId,
  );

  const hiddenKanbanFieldColumn = hiddenBoardFields.find(
    (column) => column.metadata.fieldName === recordGroupFieldMetadata?.name,
  );

  const contextStoreTargetedRecordsRule = useRecoilComponentValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const contextStoreFilters = useRecoilComponentValue(
    contextStoreFiltersComponentState,
  );

  const contextStoreFilterGroups = useRecoilComponentValue(
    contextStoreFilterGroupsComponentState,
  );

  const contextStoreAnyFieldFilterValue = useRecoilComponentValue(
    contextStoreAnyFieldFilterValueComponentState,
  );

  const { filterValueDependencies } = useFilterValueDependencies();

  const findManyRecordsParams = useFindManyRecordIndexTableParams(
    objectMetadataItem.nameSingular,
  );

  const queryFilter = computeContextStoreFilters({
    contextStoreTargetedRecordsRule,
    contextStoreFilters,
    contextStoreFilterGroups,
    objectMetadataItem,
    filterValueDependencies,
    contextStoreAnyFieldFilterValue,
  });

  const visibleRecordFields = useRecoilComponentValue(
    visibleRecordFieldsComponentSelector,
  );

  const finalColumns: Pick<
    ColumnDefinition<FieldMetadata>,
    'label' | 'type' | 'metadata'
  >[] = [
    ...visibleRecordFields
      .map((field: RecordField) => {
        const fieldMetadataItem = objectMetadataItem.fields.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === field.fieldMetadataItemId,
        );

        if (!fieldMetadataItem) {
          return null;
        }

        return {
          label: fieldMetadataItem.label,
          type: fieldMetadataItem.type,
          metadata: {
            fieldName: fieldMetadataItem.name,
            relationType: fieldMetadataItem.relation?.type,
          },
        };
      })
      .filter(isDefined),
    ...(hiddenKanbanFieldColumn && viewType === ViewType.Kanban
      ? [hiddenKanbanFieldColumn]
      : []),
  ];

  const { progress, isDownloading, fetchAllRecords } = useLazyFetchAllRecords({
    ...findManyRecordsParams,
    filter: queryFilter,
    limit: pageSize,
    delayMs,
    maximumRequests,
  });

  const getTableData = async () => {
    const result = await fetchAllRecords();
    if (result.length > 0) {
      callback(result, finalColumns);
    }
  };

  return {
    progress,
    isDownloading,
    getTableData: getTableData,
  };
};
