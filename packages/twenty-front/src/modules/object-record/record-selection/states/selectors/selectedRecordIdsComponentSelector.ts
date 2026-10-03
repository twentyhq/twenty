import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const selectedRecordIdsComponentSelector = createAtomComponentSelector<
  string[]
>({
  key: 'selectedRecordIdsComponentSelector',
  componentInstanceContext: RecordSelectionComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const allRecordIds = get(recordIndexAllRecordIdsComponentSelector, {
        instanceId,
      });

      return allRecordIds.filter(
        (recordId) =>
          get(isRecordSelectedComponentFamilyState, {
            instanceId,
            familyKey: recordId,
          }) === true,
      );
    },
});
