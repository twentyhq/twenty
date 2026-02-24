import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { createComponentSelectorV2 } from '@/ui/utilities/state/jotai/utils/createComponentSelectorV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexHasRecordsComponentSelector =
  createComponentSelectorV2<boolean>({
    key: 'recordIndexHasRecordsComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const allRecordIds = get(recordIndexAllRecordIdsComponentSelector, {
          instanceId,
        });

        return allRecordIds.length > 0;
      },
  });
