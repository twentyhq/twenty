import { recordIndexViewTabsComponentState } from '@/object-record/record-index-tab/states/recordIndexViewTabsComponentState';
import { activeRecordIndexTabIdComponentSelector } from '@/object-record/record-index-tab/states/selectors/activeRecordIndexTabIdComponentSelector';
import { isRecordIndexTabsDisplayedComponentSelector } from '@/object-record/record-index-tab/states/selectors/isRecordIndexTabsDisplayedComponentSelector';
import { isRecordIndexTabsSupportedForViewType } from '@/object-record/record-index-tab/utils/isRecordIndexTabsSupportedForViewType';
import { recordIndexTabFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexTabFieldMetadataItemComponentState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCanPersistViewChanges } from '@/views/hooks/useCanPersistViewChanges';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { ViewKey } from '@/views/types/ViewKey';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ViewTabType } from '~/generated-metadata/graphql';

export const useRecordIndexCustomTabsState = () => {
  const { currentView } = useGetCurrentViewOnly();

  const { canPersistChanges } = useCanPersistViewChanges();

  const isRecordIndexTabsEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_GROUP_TABS_ENABLED,
  );

  const recordIndexTabFieldMetadataItem = useAtomComponentStateValue(
    recordIndexTabFieldMetadataItemComponentState,
  );

  const recordIndexViewTabs = useAtomComponentStateValue(
    recordIndexViewTabsComponentState,
  );

  const isRecordIndexTabsDisplayed = useAtomComponentSelectorValue(
    isRecordIndexTabsDisplayedComponentSelector,
  );

  const activeRecordIndexTabId = useAtomComponentSelectorValue(
    activeRecordIndexTabIdComponentSelector,
  );

  // Custom tabs belong to the current view, which the default view does not allow, and a tab field replaces them
  const canEditCustomTabs =
    isRecordIndexTabsEnabled &&
    canPersistChanges &&
    currentView?.key !== ViewKey.INDEX &&
    isRecordIndexTabsSupportedForViewType(currentView?.type) &&
    !isDefined(recordIndexTabFieldMetadataItem);

  const activeCustomViewTab = isRecordIndexTabsDisplayed
    ? recordIndexViewTabs.find(
        ({ id, type }) =>
          id === activeRecordIndexTabId && type === ViewTabType.CUSTOM,
      )
    : undefined;

  return { canEditCustomTabs, activeCustomViewTab };
};
