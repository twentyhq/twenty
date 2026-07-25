import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';

import { extractRecordPositions } from '@/object-record/record-drag/utils/extractRecordPositions';
import { getShiftedRecordCalendarDateTimeUpdateInput } from '@/object-record/record-drag/utils/getShiftedRecordCalendarDateTimeUpdateInput';
import { getShiftedRecordCalendarDateUpdateInput } from '@/object-record/record-drag/utils/getShiftedRecordCalendarDateUpdateInput';
import { recordIndexCalendarEndFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarEndFieldMetadataIdComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { computeNewPositionOfDraggedRecord } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentFamilySelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorCallbackState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { Temporal } from 'temporal-polyfill';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getDragOperationType } from '@/object-record/record-drag/utils/getDragOperationType';

export const useProcessCalendarCardDrop = () => {
  const store = useStore();
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();
  const { currentView } = useGetCurrentViewOnly();
  const { updateOneRecord } = useUpdateOneRecord();
  const recordIndexCalendarEndFieldMetadataId = useAtomComponentStateValue(
    recordIndexCalendarEndFieldMetadataIdComponentState,
  );

  const { userTimezone } = useUserTimezone();

  const calendarDayRecordIdsSelector =
    useAtomComponentFamilySelectorCallbackState(
      calendarDayRecordIdsComponentFamilySelector,
    );

  const processCalendarCardDrop = useCallback(
    ({
      recordId,
      sourceDate,
      destinationDate,
      destinationIndex,
      selectedRecordIds,
    }: {
      recordId: string;
      sourceDate: string;
      destinationDate: string;
      destinationIndex: number;
      selectedRecordIds: string[];
    }) => {
      if (!currentView?.calendarFieldMetadataId) return;

      const dragOperationType = getDragOperationType({
        draggedRecordId: recordId,
        selectedRecordIds,
      });

      const destinationPlainDate = Temporal.PlainDate.from(destinationDate);
      const sourcePlainDate = Temporal.PlainDate.from(sourceDate);

      const calendarFieldMetadata = objectMetadataItem.fields.find(
        (field) => field.id === currentView.calendarFieldMetadataId,
      );
      const calendarEndFieldMetadata = objectMetadataItem.fields.find(
        (field) => field.id === recordIndexCalendarEndFieldMetadataId,
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

      let buildUpdateInput:
        | ((record: ObjectRecord) => Partial<ObjectRecord> | null)
        | null = null;

      if (calendarFieldMetadata.type === FieldMetadataType.DATE) {
        const calendarEndFieldName =
          calendarEndFieldMetadata?.type === FieldMetadataType.DATE
            ? calendarEndFieldMetadata.name
            : undefined;

        buildUpdateInput = (record) =>
          getShiftedRecordCalendarDateUpdateInput({
            record,
            calendarFieldName: calendarFieldMetadata.name,
            calendarEndFieldName,
            dayOffset,
            fallbackStartDate: destinationPlainDate.toString(),
          });
      } else if (calendarFieldMetadata.type === FieldMetadataType.DATE_TIME) {
        const calendarEndFieldName =
          calendarEndFieldMetadata?.type === FieldMetadataType.DATE_TIME
            ? calendarEndFieldMetadata.name
            : undefined;

        const fallbackStartDateTime = destinationPlainDate
          .toZonedDateTime({ timeZone: userTimezone })
          .toInstant()
          .toString();

        buildUpdateInput = (record) =>
          getShiftedRecordCalendarDateTimeUpdateInput({
            record,
            calendarFieldName: calendarFieldMetadata.name,
            calendarEndFieldName,
            dayOffset,
            timeZone: userTimezone,
            fallbackStartDateTime,
          });
      }

      if (!isDefined(buildUpdateInput)) {
        return;
      }

      const recordIdsToShift =
        dragOperationType === 'single' ? [recordId] : selectedRecordIds;

      for (const idToUpdate of recordIdsToShift) {
        const recordToShift = store.get(
          recordStoreFamilyState.atomFamily(idToUpdate),
        );

        if (!isDefined(recordToShift)) {
          continue;
        }

        const updateOneRecordInput = buildUpdateInput(recordToShift);

        if (!isDefined(updateOneRecordInput)) {
          continue;
        }

        updateOneRecord({
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
      currentView,
      objectMetadataItem.nameSingular,
      objectMetadataItem.fields,
      calendarDayRecordIdsSelector,
      userTimezone,
      updateOneRecord,
      recordIndexCalendarEndFieldMetadataId,
    ],
  );

  return {
    processCalendarCardDrop,
  };
};
