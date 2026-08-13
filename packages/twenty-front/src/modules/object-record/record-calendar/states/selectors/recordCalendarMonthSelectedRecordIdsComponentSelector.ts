import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { isRecordCalendarCardSelectedComponentFamilyState } from '@/object-record/record-calendar/record-calendar-card/states/isRecordCalendarCardSelectedComponentFamilyState';
import { recordCalendarRecordIdsComponentState } from '@/object-record/record-calendar/states/recordCalendarRecordIdsComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const recordCalendarMonthSelectedRecordIdsComponentSelector =
  createAtomComponentSelector<string[]>({
    key: 'recordCalendarMonthSelectedRecordIdsComponentSelector',
    componentInstanceContext: RecordCalendarComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const allRecordIds = get(recordCalendarRecordIdsComponentState, {
          instanceId,
        });

        return allRecordIds.filter(
          (recordId) =>
            get(isRecordCalendarCardSelectedComponentFamilyState, {
              instanceId,
              familyKey: recordId,
            }) === true,
        );
      },
  });
