import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { hasObjectMetadataItemPositionField } from '@/object-metadata/utils/hasObjectMetadataItemPositionField';

import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordCalendarRecordIdsComponentState } from '@/object-record/record-calendar/states/recordCalendarRecordIdsComponentState';
import { isRecordCalendarDayInDateRange } from '@/object-record/record-calendar/utils/isRecordCalendarDayInDateRange';
import { isRecordCalendarDayInDateTimeRange } from '@/object-record/record-calendar/utils/isRecordCalendarDayInDateTimeRange';
import { recordIndexCalendarEndFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarEndFieldMetadataIdComponentState';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';
import { isNonEmptyString } from '@sniptt/guards';

import { Temporal } from 'temporal-polyfill';
import { isDefined, isSamePlainDate } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const calendarDayRecordIdsComponentFamilySelector =
  createAtomComponentFamilySelector<
    string[],
    { day: Temporal.PlainDate; timeZone: string }
  >({
    key: 'calendarDayRecordsComponentFamilySelector',
    componentInstanceContext: RecordCalendarComponentInstanceContext,
    get:
      ({ instanceId, familyKey: { day, timeZone } }) =>
      ({ get }) => {
        const calendarFieldMetadataId = get(
          recordIndexCalendarFieldMetadataIdComponentState,
          { instanceId },
        );
        const calendarEndFieldMetadataId = get(
          recordIndexCalendarEndFieldMetadataIdComponentState,
          { instanceId },
        );

        const objectMetadataItems = get(objectMetadataItemsSelector);
        const objectMetadataItem = objectMetadataItems.find(
          (objectMetadataItem) =>
            objectMetadataItem.fields.some(
              (fieldMetadataItem) =>
                fieldMetadataItem.id === calendarFieldMetadataId,
            ),
        );

        if (!isDefined(objectMetadataItem)) {
          return [];
        }

        const fieldMetadataItem = objectMetadataItem.fields.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === calendarFieldMetadataId,
        );

        if (!isDefined(fieldMetadataItem)) {
          return [];
        }

        const endFieldMetadataItem = objectMetadataItem.fields.find(
          (fieldMetadataItem) =>
            fieldMetadataItem.id === calendarEndFieldMetadataId,
        );

        const allRecordIds = get(recordCalendarRecordIdsComponentState, {
          instanceId,
        });

        const recordIds = allRecordIds.filter((recordId) => {
          const record = get(recordStoreFamilyState, recordId);

          const recordDate = record?.[fieldMetadataItem.name];

          if (!isNonEmptyString(recordDate)) {
            return false;
          }

          if (fieldMetadataItem.type === FieldMetadataType.DATE) {
            const recordStartDate = Temporal.PlainDate.from(recordDate);
            const recordEndDateValue = isDefined(endFieldMetadataItem)
              ? record?.[endFieldMetadataItem.name]
              : undefined;

            if (
              endFieldMetadataItem?.type === FieldMetadataType.DATE &&
              isNonEmptyString(recordEndDateValue)
            ) {
              try {
                return isRecordCalendarDayInDateRange({
                  day,
                  startDate: recordStartDate,
                  endDate: Temporal.PlainDate.from(recordEndDateValue),
                });
              } catch {
                return isSamePlainDate(day, recordStartDate);
              }
            }

            return isSamePlainDate(day, recordStartDate);
          }

          const recordEndDateValue = isDefined(endFieldMetadataItem)
            ? record?.[endFieldMetadataItem.name]
            : undefined;

          return isRecordCalendarDayInDateTimeRange({
            day,
            startDateTime: recordDate,
            endDateTime:
              endFieldMetadataItem?.type === FieldMetadataType.DATE_TIME
                ? recordEndDateValue
                : undefined,
            timeZone,
          });
        });

        if (
          !objectMetadataItem.isRemote &&
          hasObjectMetadataItemPositionField(objectMetadataItem)
        ) {
          return recordIds.sort((a, b) => {
            const recordA = get(recordStoreFamilyState, a);
            const recordB = get(recordStoreFamilyState, b);

            const positionA = recordA?.position;
            const positionB = recordB?.position;

            if (!isDefined(positionA) && !isDefined(positionB)) return 0;
            if (!isDefined(positionA)) return -1;
            if (!isDefined(positionB)) return 1;

            return positionA - positionB;
          });
        }

        return recordIds;
      },
  });
