import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type SparseArray } from '~/types/SparseArray';

export const allRecordIdsWithoutGroupsComponentSelector =
  createComponentSelector<SparseArray<string>>({
    key: 'allRecordIdsWithoutGroupsComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        return get(
          recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
            instanceId,
            familyKey: NO_RECORD_GROUP_FAMILY_KEY,
          }),
        );
      },
  });
