import { useEffect } from 'react';

import { useColumnDefinitionsFromFieldMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromFieldMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useHandleToggleColumnSort } from '@/object-record/record-index/hooks/useHandleToggleColumnSort';
import { useRecordTable } from '@/object-record/record-table/hooks/useRecordTable';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewField } from '@/views/types/ViewField';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const RecordIndexTableContainerEffect = () => {
  const { recordIndexId, objectNameSingular } = useRecordIndexContextOrThrow();

  const { setAvailableTableColumns, setOnToggleColumnSort } = useRecordTable({
    recordTableId: recordIndexId,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromFieldMetadata(objectMetadataItem);

  useEffect(() => {
    setAvailableTableColumns(columnDefinitions);
  }, [columnDefinitions, setAvailableTableColumns]);

  const handleToggleColumnSort = useHandleToggleColumnSort({
    objectNameSingular,
  });

  const { currentView } = useGetCurrentViewOnly();

  useEffect(() => {
    setOnToggleColumnSort(
      () => (fieldMetadataId: string) =>
        handleToggleColumnSort(fieldMetadataId),
    );
  }, [setOnToggleColumnSort, handleToggleColumnSort]);

  const setViewFieldAggregateOperation = useRecoilCallback(
    ({ set, snapshot }) =>
      (viewField: ViewField) => {
        const aggregateOperationForViewField = snapshot
          .getLoadable(
            viewFieldAggregateOperationState({
              viewFieldId: viewField.id,
            }),
          )
          .getValue();

        const viewFieldMetadataType = columnDefinitions.find(
          (columnDefinition) =>
            columnDefinition.fieldMetadataId === viewField.fieldMetadataId,
        )?.type;

        const convertedViewFieldAggregateOperation = isDefined(
          viewField.aggregateOperation,
        )
          ? convertAggregateOperationToExtendedAggregateOperation(
              viewField.aggregateOperation,
              viewFieldMetadataType,
            )
          : viewField.aggregateOperation;

        if (
          aggregateOperationForViewField !==
          convertedViewFieldAggregateOperation
        ) {
          set(
            viewFieldAggregateOperationState({
              viewFieldId: viewField.id,
            }),
            convertedViewFieldAggregateOperation,
          );
        }
      },
    [columnDefinitions],
  );

  useEffect(() => {
    currentView?.viewFields.forEach((viewField) => {
      setViewFieldAggregateOperation(viewField);
    });
  }, [currentView, setViewFieldAggregateOperation]);

  return <></>;
};
