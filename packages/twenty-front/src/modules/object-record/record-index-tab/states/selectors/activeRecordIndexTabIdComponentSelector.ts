import { RECORD_INDEX_ALL_TAB_ID } from '@/object-record/record-index-tab/constants/RecordIndexAllTabId';
import { selectedRecordIndexTabIdComponentState } from '@/object-record/record-index-tab/states/selectedRecordIndexTabIdComponentState';
import { isRecordIndexTabsDisplayedComponentSelector } from '@/object-record/record-index-tab/states/selectors/isRecordIndexTabsDisplayedComponentSelector';
import { recordIndexTabsComponentSelector } from '@/object-record/record-index-tab/states/selectors/recordIndexTabsComponentSelector';
import { getActiveRecordIndexTabId } from '@/object-record/record-index-tab/utils/getActiveRecordIndexTabId';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const activeRecordIndexTabIdComponentSelector =
  createAtomComponentSelector<string>({
    key: 'activeRecordIndexTabIdComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        if (!get(isRecordIndexTabsDisplayedComponentSelector, { instanceId })) {
          return RECORD_INDEX_ALL_TAB_ID;
        }

        return getActiveRecordIndexTabId({
          selectedRecordIndexTabId: get(
            selectedRecordIndexTabIdComponentState,
            { instanceId },
          ),
          recordIndexTabIds: get(recordIndexTabsComponentSelector, {
            instanceId,
          }).map(({ id }) => id),
        });
      },
  });
