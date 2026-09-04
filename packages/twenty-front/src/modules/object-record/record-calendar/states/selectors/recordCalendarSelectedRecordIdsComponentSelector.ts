import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { isRecordCalendarCardSelectedComponentFamilyState } from '@/object-record/record-calendar/record-calendar-card/states/isRecordCalendarCardSelectedComponentFamilyState';
import { recordCalendarRecordIdsComponentState } from '@/object-record/record-calendar/states/recordCalendarRecordIdsComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const recordCalendarSelectedRecordIdsComponentSelector =
  createAtomComponentSelector<string[]>({
    key: 'recordCalendarSelectedRecordIdsSelector',
    componentInstanceContext: RecordCalendarComponentInstanceContext,
    get:
      ({ instanceId, surfaceId }) =>
      ({ get }) => {
        const allRecordIds = get(recordCalendarRecordIdsComponentState, {
          instanceId,
          surfaceId,
        });

        return allRecordIds.filter(
          (recordId: string) =>
            get(isRecordCalendarCardSelectedComponentFamilyState, {
              instanceId,
              surfaceId,
              familyKey: recordId,
            }) === true,
        );
      },
  });
