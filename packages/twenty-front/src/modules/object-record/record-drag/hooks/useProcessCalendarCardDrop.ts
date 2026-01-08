import { type DropResult } from '@hello-pangea/dnd';
import { useRecoilCallback } from 'recoil';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';

import { extractRecordPositions } from '@/object-record/record-drag/utils/extractRecordPositions';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { computeNewPositionOfDraggedRecord } from '@/object-record/utils/computeNewPositionOfDraggedRecord';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';

export const useProcessCalendarCardDrop = () => {
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();
  const { currentView } = useGetCurrentViewOnly();
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: objectMetadataItem.nameSingular,
  });

  const { userTimezone } = useUserTimezone();

  const calendarDayRecordIdsSelector = useRecoilComponentCallbackState(
    calendarDayRecordIdsComponentFamilySelector,
  );

  const processCalendarCardDrop = useRecoilCallback(
    ({ snapshot }) =>
      async (calendarCardDropResult: DropResult) => {
        if (
          !calendarCardDropResult.destination ||
          !currentView?.calendarFieldMetadataId
        )
          return;

        const { draggableId: recordId } = calendarCardDropResult;
        const destinationDate = calendarCardDropResult.destination.droppableId;
        const destinationIndex = calendarCardDropResult.destination.index;

        const destinationPlainDate = Temporal.PlainDate.from(destinationDate);

        const record = snapshot
          .getLoadable(recordStoreFamilyState(recordId))
          .getValue();

        if (!record) return;

        const calendarFieldMetadata = objectMetadataItem.fields.find(
          (field) => field.id === currentView.calendarFieldMetadataId,
        );

        if (!calendarFieldMetadata) return;

        const destinationRecordIds = snapshot
          .getLoadable(
            calendarDayRecordIdsSelector({
              day: destinationPlainDate,
              timeZone: userTimezone,
            }),
          )
          .getValue() as string[];

        const targetDayIsEmpty = destinationRecordIds.length === 0;

        let newPosition: number;

        if (targetDayIsEmpty) {
          newPosition = 1;
        } else {
          const recordsWithPosition = extractRecordPositions(
            destinationRecordIds,
            snapshot,
          );
          const droppedRecordIsFromAnotherList = !recordsWithPosition
            .map((recordWithPosition) => recordWithPosition.id)
            .includes(recordId);

          const isDroppedAfterList =
            (recordsWithPosition.length === 2 &&
              destinationIndex === 1 &&
              !droppedRecordIsFromAnotherList) ||
            destinationIndex === recordsWithPosition.length;

          const targetRecord = isDroppedAfterList
            ? recordsWithPosition.at(-1)
            : recordsWithPosition.at(destinationIndex);

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

        const currentFieldValue = record[calendarFieldMetadata.name];

        const currentZonedDateTime = isDefined(currentFieldValue)
          ? Temporal.Instant.from(currentFieldValue).toZonedDateTimeISO(
              userTimezone,
            )
          : null;

        const newDate = isDefined(currentZonedDateTime)
          ? currentZonedDateTime.with({
              day: destinationPlainDate.day,
              month: destinationPlainDate.month,
              year: destinationPlainDate.year,
            })
          : Temporal.PlainDate.from(destinationPlainDate).toZonedDateTime(
              userTimezone,
            );

        await updateOneRecord({
          idToUpdate: recordId,
          updateOneRecordInput: {
            [calendarFieldMetadata.name]: newDate.toInstant().toString(),
            position: newPosition,
          },
        });
      },
    [
      currentView,
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
