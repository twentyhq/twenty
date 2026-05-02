import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { hasObjectMetadataItemPositionField } from '@/object-metadata/utils/hasObjectMetadataItemPositionField';

import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordCalendarRecordIdsComponentState } from '@/object-record/record-calendar/states/recordCalendarRecordIdsComponentState';
import { recordIndexCalendarFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';
import { isNonEmptyString } from '@sniptt/guards';

import { Temporal } from 'temporal-polyfill';
import { FieldMetadataType } from 'twenty-shared/types';
import {
  isDefined,
  isFieldMetadataDateKind,
  isSamePlainDate,
} from 'twenty-shared/utils';

const warnedTimeZones = new Set<string>();

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
          recordIndexCalendarFieldMetadataIdState,
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

        const allRecordIds = get(recordCalendarRecordIdsComponentState, {
          instanceId,
        });

        let effectiveTimeZone = timeZone;

        if (!isNonEmptyString(timeZone)) {
          effectiveTimeZone = 'UTC';
        } else {
          try {
            Temporal.TimeZone.from(timeZone);
          } catch {
            if (!warnedTimeZones.has(timeZone)) {
              // oxlint-disable-next-line no-console
              console.warn(
                `Invalid timezone "${timeZone}" provided to calendarDayRecordIdsComponentFamilySelector. Falling back to UTC.`,
              );

              warnedTimeZones.add(timeZone);
            }

            effectiveTimeZone = 'UTC';
          }
        }

        const recordIds = allRecordIds.filter((recordId) => {
          const record = get(recordStoreFamilyState, recordId);

          const recordDate = record?.[fieldMetadataItem.name];

          if (!isNonEmptyString(recordDate)) {
            return false;
          }

          let recordDateAsPlainDateInTimeZone: Temporal.PlainDate;

          try {
            if (fieldMetadataItem.type === FieldMetadataType.DATE) {
              recordDateAsPlainDateInTimeZone =
                Temporal.PlainDate.from(recordDate);
            } else if (fieldMetadataItem.type === FieldMetadataType.DATE_TIME) {
              const instant = Temporal.Instant.from(recordDate);

              recordDateAsPlainDateInTimeZone = instant
                .toZonedDateTimeISO(effectiveTimeZone)
                .toPlainDate();
            } else {
              return false;
            }
          } catch {
            return false;
          }

          return isSamePlainDate(day, recordDateAsPlainDateInTimeZone);
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
