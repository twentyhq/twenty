import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { createComponentFamilySelector } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelector';

import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';

export const recordIdByRealIndexComponentFamilySelector =
  createComponentFamilySelector<string | null, { realIndex: number | null }>({
    key: 'visibleRecordGroupIdsComponentFamilySelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
      ({ get }) => {
        const realIndex = familyKey.realIndex;

        if (!isDefined(realIndex)) {
          return null;
        }

        const allRecordIds = get(
          recordIndexAllRecordIdsComponentSelector.selectorFamily({
            instanceId,
          }),
        );

        return allRecordIds[realIndex];
      },
  });
