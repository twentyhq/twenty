import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { hasObjectMetadataItemPositionField } from '@/object-metadata/utils/hasObjectMetadataItemPositionField';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordCalendarRecordIdsComponentState } from '@/object-record/record-calendar/states/recordCalendarRecordIdsComponentState';
import { recordIndexCalendarFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createComponentFamilySelector } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelector';
import { isSameDay, parse } from 'date-fns';
import { isDefined } from 'twenty-shared/utils';

export const calendarDayRecordIdsComponentFamilySelector =
  createComponentFamilySelector<string[], string>({
    key: 'calendarDayRecordsComponentFamilySelector',
    componentInstanceContext: RecordCalendarComponentInstanceContext,
    get:
      ({ instanceId, familyKey: dayAsString }) =>
      ({ get }) => {
        const calendarFieldMetadataId = get(
          recordIndexCalendarFieldMetadataIdState,
        );

        const objectMetadataItems = get(objectMetadataItemsState);
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

        const allRecordIds = get(
          recordCalendarRecordIdsComponentState.atomFamily({
            instanceId,
          }),
        );

        const recordIds = allRecordIds.filter((recordId) => {
          const record = get(recordStoreFamilyState(recordId));
          const recordDate = record?.[fieldMetadataItem.name];

          if (!recordDate) {
            return false;
          }

          const dayDate = parse(dayAsString, 'yyyy-MM-dd', new Date());
          const recordDateObj = new Date(recordDate);

          return isSameDay(recordDateObj, dayDate);
        });

        if (
          !objectMetadataItem.isRemote &&
          hasObjectMetadataItemPositionField(objectMetadataItem)
        ) {
          return recordIds.sort((a, b) => {
            const recordA = get(recordStoreFamilyState(a));
            const recordB = get(recordStoreFamilyState(b));

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
