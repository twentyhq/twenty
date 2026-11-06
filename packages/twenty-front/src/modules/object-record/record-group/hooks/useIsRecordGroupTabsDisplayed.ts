import { hasRecordGroupsComponentSelector } from '@/object-record/record-group/states/selectors/hasRecordGroupsComponentSelector';
import { isRecordGroupTabsSupportedForViewType } from '@/object-record/record-group/utils/isRecordGroupTabsSupportedForViewType';
import { recordIndexShouldDisplayGroupsAsTabsComponentState } from '@/object-record/record-index/states/recordIndexShouldDisplayGroupsAsTabsComponentState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from 'twenty-shared/types';

export const useIsRecordGroupTabsDisplayed = () => {
  const isRecordGroupTabsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_GROUP_TABS_ENABLED,
  );

  const recordIndexViewType = useAtomComponentStateValue(
    recordIndexViewTypeState,
  );

  const shouldDisplayGroupsAsTabs = useAtomComponentStateValue(
    recordIndexShouldDisplayGroupsAsTabsComponentState,
  );

  const hasRecordGroups = useAtomComponentSelectorValue(
    hasRecordGroupsComponentSelector,
  );

  return (
    isRecordGroupTabsEnabled &&
    shouldDisplayGroupsAsTabs &&
    hasRecordGroups &&
    isRecordGroupTabsSupportedForViewType(recordIndexViewType)
  );
};
