import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { isRecordGroupTabsSupportedForViewType } from '@/object-record/record-group/utils/isRecordGroupTabsSupportedForViewType';
import { recordIndexShouldDisplayGroupsAsTabsComponentState } from '@/object-record/record-index/states/recordIndexShouldDisplayGroupsAsTabsComponentState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { checkIfFeatureFlagIsEnabledOnWorkspace } from '@/workspace/utils/checkIfFeatureFlagIsEnabledOnWorkspace';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

export const isRecordGroupTabsDisplayedComponentSelector =
  createAtomComponentSelector<boolean>({
    key: 'isRecordGroupTabsDisplayedComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const isRecordGroupTabsEnabled = checkIfFeatureFlagIsEnabledOnWorkspace(
          FeatureFlagKey.IS_RECORD_GROUP_TABS_ENABLED,
          get(currentWorkspaceState),
        );

        return (
          isRecordGroupTabsEnabled &&
          get(recordIndexShouldDisplayGroupsAsTabsComponentState, {
            instanceId,
          }) &&
          isNonEmptyArray(get(recordGroupIdsComponentState, { instanceId })) &&
          isRecordGroupTabsSupportedForViewType(
            get(recordIndexViewTypeState, { instanceId }),
          )
        );
      },
  });
