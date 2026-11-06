import { ALL_RECORD_GROUPS_TAB_ID } from '@/object-record/record-group/constants/AllRecordGroupsTabId';
import { selectedRecordGroupTabIdComponentState } from '@/object-record/record-group/states/selectedRecordGroupTabIdComponentState';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { getActiveRecordGroupTabId } from '@/object-record/record-group/utils/getActiveRecordGroupTabId';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';

export const activeRecordGroupTabIdComponentSelector =
  createAtomComponentSelector<string>({
    key: 'activeRecordGroupTabIdComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const viewType = get(recordIndexViewTypeState, { instanceId });

        if (!isDefined(viewType)) {
          return ALL_RECORD_GROUPS_TAB_ID;
        }

        return getActiveRecordGroupTabId({
          selectedRecordGroupId: get(selectedRecordGroupTabIdComponentState, {
            instanceId,
          }),
          visibleRecordGroupIds: get(
            visibleRecordGroupIdsComponentFamilySelector,
            { instanceId, familyKey: viewType },
          ),
        });
      },
  });
