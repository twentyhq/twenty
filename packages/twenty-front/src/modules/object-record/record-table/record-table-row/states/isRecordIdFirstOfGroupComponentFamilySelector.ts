import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { createComponentFamilySelector } from '@/ui/utilities/state/jotai/utils/createComponentFamilySelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';

export const isRecordIdFirstOfGroupComponentFamilySelector =
  createComponentFamilySelector<boolean, string>({
    key: 'isRecordIdFirstOfGroupComponentFamilySelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId, familyKey }) =>
      ({ get }) => {
        const recordGroupIds = get(recordGroupIdsComponentState, {
          instanceId,
        });

        const hasRecordGroups = recordGroupIds.length > 0;

        if (!isDefined(familyKey)) {
          return false;
        }

        const recordIdToCheck = familyKey;

        if (hasRecordGroups) {
          for (const recordGroupId of recordGroupIds) {
            const recordIdsForThisGroup = get(
              recordIndexRecordIdsByGroupComponentFamilyState,
              { instanceId, familyKey: recordGroupId },
            );

            if (recordIdsForThisGroup[0] === recordIdToCheck) {
              return true;
            }
          }
        } else {
          const allRecordIds = get(recordIndexAllRecordIdsComponentSelector, {
            instanceId,
          });

          if (allRecordIds[0] === recordIdToCheck) {
            return true;
          }
        }

        return false;
      },
  });
