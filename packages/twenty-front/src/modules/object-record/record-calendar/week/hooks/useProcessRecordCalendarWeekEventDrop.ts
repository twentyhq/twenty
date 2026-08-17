import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { getRecordCalendarWeekEventDropDateTime } from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekEventDropDateTime';
import { getRecordCalendarWeekEventDropShift } from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekEventDropShift';
import { getShiftedRecordCalendarWeekEventUpdateInput } from '@/object-record/record-calendar/week/utils/getShiftedRecordCalendarWeekEventUpdateInput';
import { getDragOperationType } from '@/object-record/record-drag/utils/getDragOperationType';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type Temporal } from 'temporal-polyfill';
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
      const record = store.get(recordStoreFamilyState.atomFamily(recordId));

      if (!isDefined(record)) {
        return;
      }

      const primaryOriginalStart = record[calendarFieldMetadataItem.name];

      // The primary dragged record lands exactly where it was dropped.
      const shiftedDateTime = getRecordCalendarWeekEventDropDateTime({
        destinationDay,
        destinationMinutes,
        startDateTime: primaryOriginalStart,
        endDateTime:
          calendarEndFieldMetadataItem?.type === FieldMetadataType.DATE_TIME
            ? record[calendarEndFieldMetadataItem.name]
            : undefined,
        timeZone: userTimezone,
      });

      if (shiftedDateTime === null) {
        return;
      }

      await updateOneRecord({
        objectNameSingular: objectMetadataItem.nameSingular,
        idToUpdate: recordId,
        updateOneRecordInput: {
          [calendarFieldMetadataItem.name]: shiftedDateTime.startDateTime,
          ...(isDefined(calendarEndFieldMetadataItem) &&
            isDefined(shiftedDateTime.endDateTime) && {
              [calendarEndFieldMetadataItem.name]: shiftedDateTime.endDateTime,
            }),
        },
      });

      const dragOperationType = getDragOperationType({
        draggedRecordId: recordId,
        selectedRecordIds,
      });

      const recordIdsToShift =
        dragOperationType === 'multi'
          ? selectedRecordIds.filter((selectedId) => selectedId !== recordId)
          : [];

      // Measure how far the primary dragged record moved, then move every other
      // selected record by that same amount.
      const dropShift = getRecordCalendarWeekEventDropShift({
        destinationDay,
        destinationMinutes,
        startDateTime: primaryOriginalStart,
        timeZone: userTimezone,
      });

      if (!isDefined(dropShift)) {
        return;
      }

      const { dayOffset, timeOfDayDeltaNanoseconds } = dropShift;

      const calendarEndFieldName =
        calendarEndFieldMetadataItem?.type === FieldMetadataType.DATE_TIME
          ? calendarEndFieldMetadataItem.name
          : undefined;

      for (const idToUpdate of recordIdsToShift) {
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
            dayOffset,
            timeOfDayDeltaNanoseconds,
            timeZone: userTimezone,
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
