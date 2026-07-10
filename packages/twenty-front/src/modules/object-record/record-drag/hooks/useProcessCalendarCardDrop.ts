import { type DropResult } from '@hello-pangea/dnd';
import { useCallback } from 'react';
import { useStore } from 'jotai';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { getRecordIdFromRecordCalendarCardDraggableId } from '@/object-record/record-calendar/record-calendar-card/utils/getRecordCalendarCardDraggableId';

import { extractRecordPositions } from '@/object-record/record-drag/utils/extractRecordPositions';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { computeNewPositionOfDraggedRecord } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentFamilySelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorCallbackState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { Temporal } from 'temporal-polyfill';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useProcessCalendarCardDrop = () => {
  const store = useStore();
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();
  const { currentView } = useGetCurrentViewOnly();
  const { updateOneRecord } = useUpdateOneRecord();

  const { userTimezone } = useUserTimezone();

  const calendarDayRecordIdsSelector =
    useAtomComponentFamilySelectorCallbackState(
      calendarDayRecordIdsComponentFamilySelector,
    );

  const processCalendarCardDrop = useCallback(
    async (calendarCardDropResult: DropResult) => {
      if (
        !calendarCardDropResult.destination ||
        !currentView?.calendarFieldMetadataId
      )
        return;

      const recordId = getRecordIdFromRecordCalendarCardDraggableId(
        calendarCardDropResult.draggableId,
      );
      const destinationDate = calendarCardDropResult.destination.droppableId;
      const destinationIndex = calendarCardDropResult.destination.index;
      const sourceDate = calendarCardDropResult.source.droppableId;

      const destinationPlainDate = Temporal.PlainDate.from(destinationDate);
      const sourcePlainDate = Temporal.PlainDate.from(sourceDate);

      const record = store.get(recordStoreFamilyState.atomFamily(recordId));

      if (!record) return;

      const calendarFieldMetadata = objectMetadataItem.fields.find(
        (field) => field.id === currentView.calendarFieldMetadataId,
      );
      const calendarEndFieldMetadata = objectMetadataItem.fields.find(
        (field) => field.id === currentView.calendarEndFieldMetadataId,
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

      const currentFieldValue = record[calendarFieldMetadata.name] as
        | string
        | undefined;

      if (calendarFieldMetadata.type === FieldMetadataType.DATE) {
        let shiftedStartDate = destinationPlainDate.toString();
        let shiftedEndDate: string | undefined;

        if (isDefined(currentFieldValue)) {
          try {
            const currentStartDate = Temporal.PlainDate.from(currentFieldValue);
            const dayOffset = sourcePlainDate.until(destinationPlainDate).days;

            shiftedStartDate = currentStartDate
              .add({ days: dayOffset })
              .toString();

            if (calendarEndFieldMetadata?.type === FieldMetadataType.DATE) {
              const currentEndFieldValue = record[
                calendarEndFieldMetadata.name
              ] as string | undefined;

              if (isDefined(currentEndFieldValue)) {
                const currentEndDate =
                  Temporal.PlainDate.from(currentEndFieldValue);

                if (
                  Temporal.PlainDate.compare(
                    currentEndDate,
                    currentStartDate,
                  ) >= 0
                ) {
                  shiftedEndDate = currentEndDate
                    .add({ days: dayOffset })
                    .toString();
                }
              }
            }
          } catch {
            shiftedStartDate = destinationPlainDate.toString();
            shiftedEndDate = undefined;
          }
        }

        await updateOneRecord({
          objectNameSingular: objectMetadataItem.nameSingular,
          idToUpdate: recordId,
          updateOneRecordInput: {
            [calendarFieldMetadata.name]: shiftedStartDate,
            ...(isDefined(calendarEndFieldMetadata) &&
              isDefined(shiftedEndDate) && {
                [calendarEndFieldMetadata.name]: shiftedEndDate,
              }),
            position: newPosition,
          },
        });
      } else if (calendarFieldMetadata.type === FieldMetadataType.DATE_TIME) {
        const newDate = isDefined(currentFieldValue)
          ? Temporal.Instant.from(currentFieldValue)
              .toZonedDateTimeISO(userTimezone)
              .with({
                day: destinationPlainDate.day,
                month: destinationPlainDate.month,
                year: destinationPlainDate.year,
              })
          : Temporal.PlainDate.from(destinationPlainDate).toZonedDateTime(
              userTimezone,
            );
        const newStartInstant = newDate.toInstant();

        let shiftedEndDateTime: string | undefined;

        if (
          calendarEndFieldMetadata?.type === FieldMetadataType.DATE_TIME &&
          isDefined(currentFieldValue)
        ) {
          const currentEndFieldValue = record[calendarEndFieldMetadata.name] as
            | string
            | undefined;

          if (isDefined(currentEndFieldValue)) {
            try {
              const currentStartInstant =
                Temporal.Instant.from(currentFieldValue);
              const currentEndInstant =
                Temporal.Instant.from(currentEndFieldValue);

              if (
                Temporal.Instant.compare(
                  currentEndInstant,
                  currentStartInstant,
                ) > 0
              ) {
                shiftedEndDateTime = Temporal.Instant.fromEpochNanoseconds(
                  newStartInstant.epochNanoseconds +
                    (currentEndInstant.epochNanoseconds -
                      currentStartInstant.epochNanoseconds),
                ).toString();
              }
            } catch {
              shiftedEndDateTime = undefined;
            }
          }
        }

        await updateOneRecord({
          objectNameSingular: objectMetadataItem.nameSingular,
          idToUpdate: recordId,
          updateOneRecordInput: {
            [calendarFieldMetadata.name]: newStartInstant.toString(),
            ...(isDefined(calendarEndFieldMetadata) &&
              isDefined(shiftedEndDateTime) && {
                [calendarEndFieldMetadata.name]: shiftedEndDateTime,
              }),
            position: newPosition,
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
    ],
  );

  return {
    processCalendarCardDrop,
  };
};
