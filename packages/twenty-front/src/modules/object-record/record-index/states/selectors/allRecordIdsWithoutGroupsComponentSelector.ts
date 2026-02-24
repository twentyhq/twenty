import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { createComponentSelector } from '@/ui/utilities/state/jotai/utils/createComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const allRecordIdsWithoutGroupsComponentSelector =
  createComponentSelector<string[]>({
    key: 'allRecordIdsWithoutGroupsComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        return get(recordIndexRecordIdsByGroupComponentFamilyState, {
          instanceId,
          familyKey: NO_RECORD_GROUP_FAMILY_KEY,
        });
      },
  });
