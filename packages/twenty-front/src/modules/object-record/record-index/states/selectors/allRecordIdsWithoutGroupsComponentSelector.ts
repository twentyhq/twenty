import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { NO_RECORD_GROUP_FAMILY_KEY } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const allRecordIdsWithoutGroupsComponentSelector =
  createAtomComponentSelector<string[]>({
    key: 'allRecordIdsWithoutGroupsComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId, surfaceId }) =>
      ({ get }) => {
        return get(recordIndexRecordIdsByGroupComponentFamilyState, {
          instanceId,
          surfaceId,
          familyKey: NO_RECORD_GROUP_FAMILY_KEY,
        });
      },
  });
