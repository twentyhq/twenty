import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { draggedRecordIdsComponentState } from '@/object-record/record-drag/states/draggedRecordIdsComponentState';
import { type RecordDragDropResult } from '@/object-record/record-drag/types/RecordDragDropResult';

import { extractRecordPositions } from '@/object-record/record-drag/utils/extractRecordPositions';
import { getShiftedRecordCalendarDateTimeUpdateInput } from '@/object-record/record-drag/utils/getShiftedRecordCalendarDateTimeUpdateInput';
import { getShiftedRecordCalendarDateUpdateInput } from '@/object-record/record-drag/utils/getShiftedRecordCalendarDateUpdateInput';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { computeNewPositionOfDraggedRecord } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentFamilySelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorCallbackState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { Temporal } from 'temporal-polyfill';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useProcessCalendarCardDrop = () => {
  const store = useStore();
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();
  const recordIndexCalendarFieldMetadataId = useAtomComponentStateValue(
    recordIndexCalendarFieldMetadataIdComponentState,
  );
  const { updateOneRecord } = useUpdateOneRecord();

  const { userTimezone } = useUserTimezone();

  const calendarDayRecordIdsSelector =
    useAtomComponentFamilySelectorCallbackState(
      calendarDayRecordIdsComponentFamilySelector,
    );

  const draggedRecordIdsCallbackState = useAtomComponentStateCallbackState(
    draggedRecordIdsComponentState,
  );

  const processCalendarCardDrop = useCallback(
    async ({
      draggedRecordId: recordId,
      sourceDroppableId: sourceDate,
      destinationDroppableId: destinationDate,
      destinationIndex,
    }: RecordDragDropResult) => {
      // Read before any await: the drag provider clears it once this call returns
      const draggedRecordIds = store.get(draggedRecordIdsCallbackState);

      if (!recordIndexCalendarFieldMetadataId) return;

      const destinationPlainDate = Temporal.PlainDate.from(destinationDate);
      const sourcePlainDate = Temporal.PlainDate.from(sourceDate);

      const calendarFieldMetadata = objectMetadataItem.fields.find(
        (field) => field.id === recordIndexCalendarFieldMetadataId,
      );

      if (!calendarFieldMetadata) return;

      const destinationRecordIdsIncludingDraggedRecord = store.get(
        calendarDayRecordIdsSelector({
          day: destinationPlainDate,
          timeZone: userTimezone,
        }),
      );

      const isCrossDayDrop = sourceDate !== destinationDate;
      const draggedRecordIndexInDestination =
        destinationRecordIdsIncludingDraggedRecord.indexOf(recordId);
      const destinationRecordIds = isCrossDayDrop
        ? destinationRecordIdsIncludingDraggedRecord.filter(
            (destinationRecordId) => destinationRecordId !== recordId,
          )
        : destinationRecordIdsIncludingDraggedRecord;
      const adjustedDestinationIndex =
        isCrossDayDrop &&
        draggedRecordIndexInDestination !== -1 &&
        draggedRecordIndexInDestination < destinationIndex
          ? destinationIndex - 1
          : destinationIndex;

      const targetDayIsEmpty = destinationRecordIds.length === 0;

      let newPosition: number;

      if (targetDayIsEmpty) {
        newPosition = 1;
      } else {
        const recordsWithPosition = extractRecordPositions(
          destinationRecordIds,
          store,
        );
        const droppedRecordIsFromAnotherList = !recordsWithPosition
          .map((recordWithPosition) => recordWithPosition.id)
          .includes(recordId);

        const isDroppedAfterList =
          (recordsWithPosition.length === 2 &&
            adjustedDestinationIndex === 1 &&
            !droppedRecordIsFromAnotherList) ||
          adjustedDestinationIndex === recordsWithPosition.length;

        const targetRecord = isDroppedAfterList
          ? recordsWithPosition.at(-1)
          : recordsWithPosition.at(adjustedDestinationIndex);

        if (!isDefined(targetRecord)) {
          throw new Error(
            `targetRecord cannot be found in passed recordsWithPosition, this should not happen.`,
          );
        }

        newPosition = computeNewPositionOfDraggedRecord({
          arrayOfRecordsWithPosition: recordsWithPosition,
          idOfItemToMove: recordId,
          idOfTargetItem: targetRecord.id,
          isDroppedAfterList,
        });
      }

      const dayOffset = sourcePlainDate.until(destinationPlainDate).days;

      for (const idToUpdate of draggedRecordIds) {
        const recordToShift = store.get(
          recordStoreFamilyState.atomFamily(idToUpdate),
        );

        if (!isDefined(recordToShift)) {
          continue;
        }
        const updateOneRecordInput =
          calendarFieldMetadata.type === FieldMetadataType.DATE
            ? getShiftedRecordCalendarDateUpdateInput({
                record: recordToShift,
                calendarFieldName: calendarFieldMetadata.name,
                dayOffset,
                fallbackStartDate: destinationPlainDate.toString(),
              })
            : getShiftedRecordCalendarDateTimeUpdateInput({
                record: recordToShift,
                calendarFieldName: calendarFieldMetadata.name,
                dayOffset,
                timeZone: userTimezone,
                fallbackStartDateTime: destinationPlainDate
                  .toZonedDateTime({ timeZone: userTimezone })
                  .toInstant()
                  .toString(),
              });

        await updateOneRecord({
          objectNameSingular: objectMetadataItem.nameSingular,
          idToUpdate,
          updateOneRecordInput: {
            ...updateOneRecordInput,
            ...(idToUpdate === recordId && { position: newPosition }),
          },
        });
      }
    },
    [
      store,
      recordIndexCalendarFieldMetadataId,
      objectMetadataItem.nameSingular,
      objectMetadataItem.fields,
      calendarDayRecordIdsSelector,
      draggedRecordIdsCallbackState,
      userTimezone,
      updateOneRecord,
    ],
  );

  return {
    processCalendarCardDrop,
  };
};
