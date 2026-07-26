import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { getRecordCalendarWeekEventDropDateTime } from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekEventDropDateTime';
import { getShiftedRecordCalendarWeekEventUpdateInput } from '@/object-record/record-calendar/week/utils/getShiftedRecordCalendarWeekEventUpdateInput';
import { getDragOperationType } from '@/object-record/record-drag/utils/getDragOperationType';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type ProcessRecordCalendarWeekEventDropArgs = {
  destinationDay: Temporal.PlainDate;
  destinationMinutes: number;
  recordId: string;
  selectedRecordIds: string[];
};

export const useProcessRecordCalendarWeekEventDrop = () => {
  const store = useStore();
  const { objectMetadataItem } = useRecordCalendarContextOrThrow();
  const { currentView } = useGetCurrentViewOnly();
  const { updateOneRecord } = useUpdateOneRecord();
  const { userTimezone } = useUserTimezone();

  const processRecordCalendarWeekEventDrop = useCallback(
    async ({
      destinationDay,
      destinationMinutes,
      recordId,
      selectedRecordIds,
    }: ProcessRecordCalendarWeekEventDropArgs) => {
      const calendarFieldMetadataItem = objectMetadataItem.fields.find(
        (field) => field.id === currentView?.calendarFieldMetadataId,
      );

      if (calendarFieldMetadataItem?.type !== FieldMetadataType.DATE_TIME) {
        return;
      }

      const calendarEndFieldMetadataItem = objectMetadataItem.fields.find(
        (field) => field.id === currentView?.calendarEndFieldMetadataId,
      );
      const calendarEndFieldName =
        calendarEndFieldMetadataItem?.type === FieldMetadataType.DATE_TIME
          ? calendarEndFieldMetadataItem.name
          : undefined;

      const record = store.get(recordStoreFamilyState.atomFamily(recordId));

      if (!isDefined(record)) {
        return;
      }

      const draggedStartDateTime = record[calendarFieldMetadataItem.name];

      const shiftedDateTime = getRecordCalendarWeekEventDropDateTime({
        destinationDay,
        destinationMinutes,
        startDateTime: draggedStartDateTime,
        endDateTime: isDefined(calendarEndFieldName)
          ? record[calendarEndFieldName]
          : undefined,
        timeZone: userTimezone,
      });

      if (shiftedDateTime === null) {
        return;
      }

      const dragOperationType = getDragOperationType({
        draggedRecordId: recordId,
        selectedRecordIds,
      });

      // The dragged record snaps to the drop slot; the rest of the selection
      // moves by the same delta so it keeps its relative layout.
      const deltaNanoseconds =
        Temporal.Instant.from(shiftedDateTime.startDateTime).epochNanoseconds -
        Temporal.Instant.from(draggedStartDateTime).epochNanoseconds;

      const recordIdsToShift =
        dragOperationType === 'single' ? [recordId] : selectedRecordIds;

      for (const idToUpdate of recordIdsToShift) {
        if (idToUpdate === recordId) {
          await updateOneRecord({
            objectNameSingular: objectMetadataItem.nameSingular,
            idToUpdate: recordId,
            updateOneRecordInput: {
              [calendarFieldMetadataItem.name]: shiftedDateTime.startDateTime,
              ...(isDefined(calendarEndFieldName) &&
                isDefined(shiftedDateTime.endDateTime) && {
                  [calendarEndFieldName]: shiftedDateTime.endDateTime,
                }),
            },
          });

          continue;
        }

        const recordToShift = store.get(
          recordStoreFamilyState.atomFamily(idToUpdate),
        );

        if (!isDefined(recordToShift)) {
          continue;
        }

        const updateOneRecordInput =
          getShiftedRecordCalendarWeekEventUpdateInput({
            record: recordToShift,
            calendarFieldName: calendarFieldMetadataItem.name,
            calendarEndFieldName,
            deltaNanoseconds,
          });

        if (!isDefined(updateOneRecordInput)) {
          continue;
        }

        await updateOneRecord({
          objectNameSingular: objectMetadataItem.nameSingular,
          idToUpdate,
          updateOneRecordInput,
        });
      }
    },
    [
      currentView?.calendarEndFieldMetadataId,
      currentView?.calendarFieldMetadataId,
      objectMetadataItem.fields,
      objectMetadataItem.nameSingular,
      store,
      updateOneRecord,
      userTimezone,
    ],
  );

  return { processRecordCalendarWeekEventDrop };
};
