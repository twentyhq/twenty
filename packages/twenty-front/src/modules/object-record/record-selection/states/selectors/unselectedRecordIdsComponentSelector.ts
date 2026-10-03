import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { RecordSelectionComponentInstanceContext } from '@/object-record/record-selection/states/contexts/RecordSelectionComponentInstanceContext';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';

export const unselectedRecordIdsComponentSelector = createAtomComponentSelector<
  string[]
>({
  key: 'unselectedRecordIdsComponentSelector',
  componentInstanceContext: RecordSelectionComponentInstanceContext,
  areEqual: isDeeplyEqual,
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
          }) === false,
      );
    },
});
