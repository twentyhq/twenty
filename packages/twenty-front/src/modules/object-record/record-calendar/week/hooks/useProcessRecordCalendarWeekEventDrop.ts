import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRecordCalendarContextOrThrow } from '@/object-record/record-calendar/contexts/RecordCalendarContext';
import { getRecordCalendarWeekEventDropDateTime } from '@/object-record/record-calendar/week/utils/getRecordCalendarWeekEventDropDateTime';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import type { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

type ProcessRecordCalendarWeekEventDropArgs = {
  destinationDay: Temporal.PlainDate;
  destinationMinutes: number;
  recordId: string;
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
