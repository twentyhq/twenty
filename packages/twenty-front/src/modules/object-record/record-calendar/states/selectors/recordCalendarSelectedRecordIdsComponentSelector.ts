import { isRecordCalendarCardSelectedComponentFamilyState } from '@/object-record/record-calendar/record-calendar-card/states/isRecordCalendarCardSelectedComponentFamilyState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { createComponentSelector } from '@/ui/utilities/state/jotai/utils/createComponentSelector';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';

export const recordCalendarSelectedRecordIdsComponentSelector =
  createComponentSelector<string[]>({
    key: 'recordCalendarSelectedRecordIdsSelector',
    componentInstanceContext: RecordCalendarComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const allRecordIds = get(recordIndexAllRecordIdsComponentSelector, {
          instanceId,
        });

        return allRecordIds.filter(
          (recordId: string) =>
            get(isRecordCalendarCardSelectedComponentFamilyState, {
              instanceId,
              familyKey: recordId,
            }) === true,
        );
      },
  });
