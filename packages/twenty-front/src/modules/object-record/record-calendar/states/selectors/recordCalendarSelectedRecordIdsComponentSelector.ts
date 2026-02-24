import { isRecordCalendarCardSelectedComponentFamilyState } from '@/object-record/record-calendar/record-calendar-card/states/isRecordCalendarCardSelectedComponentFamilyState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { createComponentSelectorV2 } from '@/ui/utilities/state/jotai/utils/createComponentSelectorV2';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';

export const recordCalendarSelectedRecordIdsComponentSelector =
  createComponentSelectorV2<string[]>({
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
