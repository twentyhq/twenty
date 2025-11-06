import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

import { contextStoreAnyFieldFilterValueComponentState } from '@/context-store/states/contextStoreAnyFieldFilterValueComponentState';
import { contextStoreFilterGroupsComponentState } from '@/context-store/states/contextStoreFilterGroupsComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { computeContextStoreFilters } from '@/context-store/utils/computeContextStoreFilters';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { useLazyFetchAllRecords } from '@/object-record/hooks/useLazyFetchAllRecords';
import { EXPORT_TABLE_DATA_DEFAULT_PAGE_SIZE } from '@/object-record/object-options-dropdown/constants/ExportTableDataDefaultPageSize';
import { useObjectOptionsForBoard } from '@/object-record/object-options-dropdown/hooks/useObjectOptionsForBoard';
import { useFilterValueDependencies } from '@/object-record/record-filter/hooks/useFilterValueDependencies';
import { recordGroupFieldMetadataComponentState } from '@/object-record/record-group/states/recordGroupFieldMetadataComponentState';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { ViewType } from '@/views/types/ViewType';
import { useMemo } from 'react';
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
    columns: ColumnDefinition<FieldMetadata>[],
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
  const { hiddenBoardFields, visibleBoardFields } = useObjectOptionsForBoard({
    objectNameSingular: objectMetadataItem.nameSingular,
    recordBoardId: recordIndexId,
    viewBarId: recordIndexId,
  });

  const recordGroupFieldMetadata = useRecoilComponentValue(
    recordGroupFieldMetadataComponentState,
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

  const finalColumns = [
    ...visibleBoardFields,
    ...(hiddenKanbanFieldColumn && viewType === ViewType.Kanban
      ? [hiddenKanbanFieldColumn]
      : []),
  ];

  const { objectMetadataItems } = useObjectMetadataItems();

  const recordGqlFields = useMemo(() => {
    if (visibleBoardFields.length === 0) {
      return undefined;
    }

    const visibleFieldMetadataItems = visibleBoardFields
      .map((column) =>
        objectMetadataItem.fields.find(
          (field) => field.id === column.fieldMetadataId,
        ),
      )
      .filter(isDefined);

    if (visibleFieldMetadataItems.length === 0) {
      return undefined;
    }

    const fieldsToInclude = [
      ...visibleFieldMetadataItems,
      ...(isDefined(recordGroupFieldMetadata?.id)
        ? [
            objectMetadataItem.fields.find(
              (field) => field.id === recordGroupFieldMetadata.id,
            ),
          ].filter(isDefined)
        : []),
    ];

    const generatedFields = generateDepthRecordGqlFieldsFromFields({
      objectMetadataItems,
      fields: fieldsToInclude,
      depth: 1,
    });

    return {
      id: true,
      ...generatedFields,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    };
  }, [
    visibleBoardFields,
    objectMetadataItem,
    objectMetadataItems,
    recordGroupFieldMetadata,
  ]);

  const { progress, isDownloading, fetchAllRecords } = useLazyFetchAllRecords({
    ...findManyRecordsParams,
    filter: queryFilter,
    limit: pageSize,
    delayMs,
    maximumRequests,
    recordGqlFields,
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
