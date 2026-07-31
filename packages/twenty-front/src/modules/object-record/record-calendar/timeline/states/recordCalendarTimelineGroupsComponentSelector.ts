import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordCalendarRecordIdsComponentState } from '@/object-record/record-calendar/states/recordCalendarRecordIdsComponentState';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { type RecordCalendarTimelineMonthGroup } from '@/object-record/record-calendar/timeline/types/RecordCalendarTimelineGroup';
import { getRecordCalendarTimelineGroups } from '@/object-record/record-calendar/timeline/utils/getRecordCalendarTimelineGroups';
import { recordIndexCalendarFieldMetadataIdComponentState } from '@/object-record/record-index/states/recordIndexCalendarFieldMetadataIdComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { createAtomComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilySelector';
import { isDefined } from 'twenty-shared/utils';

export const recordCalendarTimelineGroupsComponentSelector =
  createAtomComponentFamilySelector<
    RecordCalendarTimelineMonthGroup[],
    { timeZone: string }
  >({
    key: 'recordCalendarTimelineGroupsComponentSelector',
    componentInstanceContext: RecordCalendarComponentInstanceContext,
    get:
      ({ instanceId, familyKey: { timeZone } }) =>
      ({ get }) => {
        const calendarFieldMetadataId = get(
          recordIndexCalendarFieldMetadataIdComponentState,
          { instanceId },
        );
        const objectMetadataItems = get(objectMetadataItemsSelector);
        const calendarFieldMetadataItem = objectMetadataItems
          .flatMap(({ fields }) => fields)
          .find(({ id }) => id === calendarFieldMetadataId);

        if (!isDefined(calendarFieldMetadataItem)) {
          return [];
        }

        const recordIds = get(recordCalendarRecordIdsComponentState, {
          instanceId,
        });
        const records = recordIds
          .map((recordId) => get(recordStoreFamilyState, recordId))
          .filter(isDefined);
        const selectedDate = get(recordCalendarSelectedDateComponentState, {
          instanceId,
        });

        return getRecordCalendarTimelineGroups({
          calendarFieldName: calendarFieldMetadataItem.name,
          calendarFieldType: calendarFieldMetadataItem.type,
          records,
          selectedDate,
          timeZone,
        });
      },
  });
