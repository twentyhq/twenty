import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { hasObjectMetadataItemPositionField } from '@/object-metadata/utils/hasObjectMetadataItemPositionField';

import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordCalendarRecordIdsComponentState } from '@/object-record/record-calendar/states/recordCalendarRecordIdsComponentState';
import { recordIndexCalendarFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createComponentFamilySelectorV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilySelectorV2';
import { isNonEmptyString } from '@sniptt/guards';

import { Temporal } from 'temporal-polyfill';
import { isDefined, isSamePlainDate } from 'twenty-shared/utils';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const calendarDayRecordIdsComponentFamilySelector =
  createComponentFamilySelectorV2<
    string[],
    { day: Temporal.PlainDate; timeZone: string }
  >({
    key: 'calendarDayRecordsComponentFamilySelector',
    componentInstanceContext: RecordCalendarComponentInstanceContext,
    get:
      ({ instanceId, familyKey: { day, timeZone } }) =>
      ({ get }) => {
        const calendarFieldMetadataId = jotaiStore.get(
          recordIndexCalendarFieldMetadataIdState.atom,
        );

        const objectMetadataItems = jotaiStore.get(
          objectMetadataItemsState.atom,
        );
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

        const recordIds = allRecordIds.filter((recordId) => {
          const record = jotaiStore.get(
            recordStoreFamilyState.atomFamily(recordId),
          );
          const recordDate = record?.[fieldMetadataItem.name];

          if (!isNonEmptyString(recordDate)) {
            return false;
          }

          const recordDateAsPlainDateInTimeZone =
            fieldMetadataItem.type === FieldMetadataType.DATE
              ? Temporal.PlainDate.from(recordDate)
              : Temporal.Instant.from(recordDate)
                  .toZonedDateTimeISO(timeZone)
                  .toPlainDate();

          return isSamePlainDate(day, recordDateAsPlainDateInTimeZone);
        });

        if (
          !objectMetadataItem.isRemote &&
          hasObjectMetadataItemPositionField(objectMetadataItem)
        ) {
          return recordIds.sort((a, b) => {
            const recordA = jotaiStore.get(
              recordStoreFamilyState.atomFamily(a),
            );
            const recordB = jotaiStore.get(
              recordStoreFamilyState.atomFamily(b),
            );

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
