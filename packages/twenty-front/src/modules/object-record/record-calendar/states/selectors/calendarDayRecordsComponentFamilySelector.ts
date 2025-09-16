import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordIndexCalendarFieldMetadataIdState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createComponentFamilySelector } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelector';
import { isSameDay } from 'date-fns';
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
          recordIndexAllRecordIdsComponentSelector.selectorFamily({
            instanceId,
          }),
        );

        const recordIds = allRecordIds.filter((recordId) => {
          const record = get(recordStoreFamilyState(recordId));
          const recordDate = record?.[fieldMetadataItem.name];

          if (!recordDate) {
            return false;
          }

          const dayDate = new Date(dayAsString);
          const recordDateObj = new Date(recordDate);

          return isSameDay(recordDateObj, dayDate);
        });

        return recordIds;
      },
  });
