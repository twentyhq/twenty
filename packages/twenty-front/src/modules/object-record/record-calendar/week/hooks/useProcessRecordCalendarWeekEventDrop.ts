import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { getRecordCalendarWeekEventDropDateTime } from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekEventDropDateTime';
import { getDragOperationType } from '@/object-record/record-drag/utils/getDragOperationType';
import { getShiftedRecordCalendarEndDateTime } from '@/object-record/record-drag/utils/getShiftedRecordCalendarEndDateTime';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
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
      const record = store.get(recordStoreFamilyState.atomFamily(recordId));

      if (!isDefined(record)) {
        return;
      }

      const shiftedDateTime = getRecordCalendarWeekEventDropDateTime({
        destinationDay,
        destinationMinutes,
        startDateTime: record[calendarFieldMetadataItem.name],
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

      const primaryOriginalStart = record[calendarFieldMetadataItem.name];

      const shiftDurationNanoseconds =
        Temporal.Instant.from(shiftedDateTime.startDateTime).epochNanoseconds -
        Temporal.Instant.from(primaryOriginalStart).epochNanoseconds;

      for (const idToUpdate of recordIdsToShift) {
        const recordToShift = store.get(
          recordStoreFamilyState.atomFamily(idToUpdate),
        );
        if (!isDefined(recordToShift)) {
          continue;
        }

        const originalStart = recordToShift[calendarFieldMetadataItem.name];

        const originalStartInstant = Temporal.Instant.from(originalStart);
        const shiftedStartInstant = Temporal.Instant.fromEpochNanoseconds(
          originalStartInstant.epochNanoseconds + shiftDurationNanoseconds,
        );

        const shiftedEndDateTime =
          calendarEndFieldMetadataItem?.type === FieldMetadataType.DATE_TIME
            ? getShiftedRecordCalendarEndDateTime({
                endDateTime: recordToShift[calendarEndFieldMetadataItem.name],
                originalStartInstant,
                shiftedStartInstant,
              })
            : undefined;

        await updateOneRecord({
          objectNameSingular: objectMetadataItem.nameSingular,
          idToUpdate,
          updateOneRecordInput: {
            [calendarFieldMetadataItem.name]: shiftedStartInstant.toString(),
            ...(isDefined(calendarEndFieldMetadataItem) &&
              isDefined(shiftedEndDateTime) && {
                [calendarEndFieldMetadataItem.name]: shiftedEndDateTime,
              }),
          },
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
