import { useEffect } from 'react';

import { useColumnDefinitionsFromObjectMetadata } from '@/object-metadata/hooks/useColumnDefinitionsFromObjectMetadata';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { convertAggregateOperationToExtendedAggregateOperation } from '@/object-record/utils/convertAggregateOperationToExtendedAggregateOperation';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { type ViewField } from '@/views/types/ViewField';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const RecordIndexTableContainerEffect = () => {
  const { objectNameSingular } = useRecordIndexContextOrThrow();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { columnDefinitions } =
    useColumnDefinitionsFromObjectMetadata(objectMetadataItem);

  const { currentView } = useGetCurrentViewOnly();

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
