import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { ReactNode } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { getDraggedRecordPosition } from '@/object-record/record-board/utils/getDraggedRecordPosition';
import { recordGroupDefinitionFamilyState } from '@/object-record/record-group/states/recordGroupDefinitionFamilyState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexSortsState } from '@/object-record/record-index/states/recordIndexSortsState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTableContextOrThrow } from '@/object-record/record-table/contexts/RecordTableContext';
import { isRemoveSortingModalOpenState } from '@/object-record/record-table/states/isRemoveSortingModalOpenState';
import { useRecoilComponentCallbackStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackStateV2';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import { isDefined } from '~/utils/isDefined';

export const RecordTableBodyRecordGroupDragDropContextProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { objectNameSingular, objectMetadataItem } =
    useRecordTableContextOrThrow();

  const { updateOneRecord: updateOneRow } = useUpdateOneRecord({
    objectNameSingular,
  });

  const setIsRemoveSortingModalOpenState = useSetRecoilState(
    isRemoveSortingModalOpenState,
  );

  const recordIdsByGroupFamilyState = useRecoilComponentCallbackStateV2(
    recordIndexRecordIdsByGroupComponentFamilyState,
  );

  const handleDragEnd = useRecoilCallback(
    ({ snapshot }) =>
      (result: DropResult) => {
        const destinationRecordGroupId = result.destination?.droppableId;

        if (!isDefined(result.destination)) {
          throw new Error('Drop Destination is not defined');
        }

        if (!isDefined(destinationRecordGroupId)) {
          throw new Error('Record group id is not defined');
        }

        const destinationRecordGroup = getSnapshotValue(
          snapshot,
          recordGroupDefinitionFamilyState(destinationRecordGroupId),
        );

        const indexSorts = snapshot
          .getLoadable(recordIndexSortsState)
          .getValue();

        if (!isDefined(destinationRecordGroup)) {
          throw new Error('Record group is not defined');
        }

        const fieldMetadata = objectMetadataItem.fields.find(
          (field) => field.id === destinationRecordGroup.fieldMetadataId,
        );

        if (!isDefined(fieldMetadata)) {
          throw new Error('Field metadata is not defined');
        }

        if (indexSorts.length > 0) {
          setIsRemoveSortingModalOpenState(true);
          return;
        }

        const isSourceIndexBeforeDestinationIndexInSameGroup =
          result.source.index < result.destination.index &&
          result.source.droppableId === result.destination.droppableId;

        const destinationGroupRecordIds = getSnapshotValue(
          snapshot,
          recordIdsByGroupFamilyState(destinationRecordGroupId),
        );

        const recordBeforeDestinationId =
          destinationGroupRecordIds[
            isSourceIndexBeforeDestinationIndexInSameGroup
              ? result.destination.index
              : result.destination.index - 1
          ];

        const recordBeforeDestination = recordBeforeDestinationId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordBeforeDestinationId))
              .getValue()
          : null;

        const recordAfterDestinationId =
          destinationGroupRecordIds[
            isSourceIndexBeforeDestinationIndexInSameGroup
              ? result.destination.index + 1
              : result.destination.index
          ];

        const recordAfterDestination = recordAfterDestinationId
          ? snapshot
              .getLoadable(recordStoreFamilyState(recordAfterDestinationId))
              .getValue()
          : null;

        const newPosition = getDraggedRecordPosition(
          recordBeforeDestination?.position,
          recordAfterDestination?.position,
        );

        if (!isDefined(newPosition)) {
          return;
        }

        updateOneRow({
          idToUpdate: result.draggableId,
          updateOneRecordInput: {
            position: newPosition,
            [fieldMetadata.name]: destinationRecordGroup.value,
          },
        });
      },
    [
      objectMetadataItem.fields,
      recordIdsByGroupFamilyState,
      updateOneRow,
      setIsRemoveSortingModalOpenState,
    ],
  );

  return (
    <DragDropContext onDragEnd={handleDragEnd}>{children}</DragDropContext>
  );
};
