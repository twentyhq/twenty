import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';
import { isRecordCalendarCardSelectedComponentFamilyState } from '../../record-calendar-card/states/isRecordCalendarCardSelectedComponentFamilyState';
import { RecordCalendarComponentInstanceContext } from '../contexts/RecordCalendarComponentInstanceContext';

export const recordCalendarSelectedRecordIdsComponentSelector =
  createComponentSelector<string[]>({
    key: 'recordCalendarSelectedRecordIdsSelector',
    componentInstanceContext: RecordCalendarComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const allRecordIds = get(
          recordIndexAllRecordIdsComponentSelector.selectorFamily({
            instanceId,
          }),
        );

        return allRecordIds.filter(
          (recordId) =>
            get(
              isRecordCalendarCardSelectedComponentFamilyState.atomFamily({
                instanceId,
                familyKey: recordId,
              }),
            ) === true,
        );
      },
  });
