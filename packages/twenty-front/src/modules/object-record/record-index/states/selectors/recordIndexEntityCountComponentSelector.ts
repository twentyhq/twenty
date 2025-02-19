import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { recordIndexEntityCountByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexEntityCountByGroupComponentFamilyState';
import { recordIndexEntityCountNoGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexEntityCountNoGroupComponentFamilyState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexEntityCountComponentSelector =
  createComponentSelectorV2<number | undefined>({
    key: 'recordIndexEntityCountComponentSelector',
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const recordGroupIds = get(
          recordGroupIdsComponentState.atomFamily({
            instanceId,
          }),
        );

        if (recordGroupIds.length === 0) {
          return get(
            recordIndexEntityCountNoGroupComponentFamilyState.atomFamily({
              instanceId,
            }),
          );
        }

        return recordGroupIds.reduce<number>((acc, recordGroupId) => {
          const count = get(
            recordIndexEntityCountByGroupComponentFamilyState.atomFamily({
              instanceId,
              familyKey: recordGroupId,
            }),
          );

          return acc + (count ?? 0);
        }, 0);
      },
    componentInstanceContext: ViewComponentInstanceContext,
  });
