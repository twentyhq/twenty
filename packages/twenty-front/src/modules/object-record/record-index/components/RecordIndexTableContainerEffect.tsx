import { useEffect } from 'react';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useHandleToggleColumnFilter } from '@/object-record/record-index/hooks/useHandleToggleColumnFilter';
import { useHandleToggleColumnSort } from '@/object-record/record-index/hooks/useHandleToggleColumnSort';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { aggregateOperationForViewFieldState } from '@/object-record/record-table/record-table-footer/states/aggregateOperationForViewFieldState';
import { useGetCurrentView } from '@/views/hooks/useGetCurrentView';
import { useSetRecordCountInCurrentView } from '@/views/hooks/useSetRecordCountInCurrentView';
import { ViewField } from '@/views/types/ViewField';
import { useRecoilCallback } from 'recoil';

export const RecordIndexTableContainerEffect = () => {
  const { recordIndexId, objectNameSingular } = useRecordIndexContextOrThrow();

  const viewBarId = recordIndexId;

  const {
    setAvailableTableColumns,
    setOnEntityCountChange,
    setOnToggleColumnFilter,
    setOnToggleColumnSort,
  } = useRecordTable({
    recordTableId: recordIndexId,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  const { setRecordCountInCurrentView } =
    useSetRecordCountInCurrentView(viewBarId);

  useEffect(() => {
    setAvailableTableColumns(columnDefinitions);
  }, [columnDefinitions, setAvailableTableColumns]);

  const handleToggleColumnFilter = useHandleToggleColumnFilter({
    objectNameSingular,
    viewBarId,
  });

  const handleToggleColumnSort = useHandleToggleColumnSort({
    objectNameSingular,
    viewBarId,
  });

  const { currentViewWithSavedFiltersAndSorts } = useGetCurrentView();

  useEffect(() => {
    setOnToggleColumnFilter(
      () => (fieldMetadataId: string) =>
        handleToggleColumnFilter(fieldMetadataId),
    );
  }, [setOnToggleColumnFilter, handleToggleColumnFilter]);

  useEffect(() => {
    setOnToggleColumnSort(
      () => (fieldMetadataId: string) =>
        handleToggleColumnSort(fieldMetadataId),
    );
  }, [setOnToggleColumnSort, handleToggleColumnSort]);

  useEffect(() => {
    setOnEntityCountChange(
      () => (entityCount: number) => setRecordCountInCurrentView(entityCount),
    );
  }, [setRecordCountInCurrentView, setOnEntityCountChange]);

  const setViewFieldAggregateOperation = useRecoilCallback(
    ({ set, snapshot }) =>
      (viewField: ViewField) => {
        const aggregateOperationForViewField = snapshot
          .getLoadable(
            aggregateOperationForViewFieldState({
              viewFieldId: viewField.id,
            }),
          )
          .getValue();

        if (aggregateOperationForViewField !== viewField.aggregateOperation) {
          set(
            aggregateOperationForViewFieldState({
              viewFieldId: viewField.id,
            }),
            viewField.aggregateOperation,
          );
        }
      },
    [],
  );

  useEffect(() => {
    currentViewWithSavedFiltersAndSorts?.viewFields.forEach((viewField) => {
      setViewFieldAggregateOperation(viewField);
    });
  }, [
    currentViewWithSavedFiltersAndSorts?.viewFields,
    setViewFieldAggregateOperation,
  ]);

  return <></>;
};
