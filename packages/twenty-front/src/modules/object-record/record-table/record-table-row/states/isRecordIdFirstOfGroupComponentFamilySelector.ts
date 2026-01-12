import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { createComponentFamilySelector } from '@/ui/utilities/state/component-state/utils/createComponentFamilySelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { type Nullable } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isRecordIdFirstOfGroupComponentFamilySelector =
  createComponentFamilySelector<boolean, Nullable<string>>({
    key: 'isRecordIdFirstOfGroupComponentFamilySelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ familyKey, instanceId }) =>
      ({ get }) => {
        const recordGroupIds = get(
          recordGroupIdsComponentState.atomFamily({
            instanceId,
          }),
        );

        const hasRecordGroups = recordGroupIds.length > 0;

        if (!isDefined(familyKey)) {
          return false;
        }

        if (hasRecordGroups) {
          for (const recordGroupId of recordGroupIds) {
            const recordIdsForThisGroup = get(
              recordIndexRecordIdsByGroupComponentFamilyState.atomFamily({
                instanceId,
                familyKey: recordGroupId,
              }),
            );

            if (recordIdsForThisGroup[0] === familyKey) {
              return true;
            }
          }
        } else {
          const allRecordIds = get(
            recordIndexAllRecordIdsComponentSelector.selectorFamily({
              instanceId,
            }),
          );

          if (allRecordIds[0] === familyKey) {
            return true;
          }
        }

        return false;
      },
  });
