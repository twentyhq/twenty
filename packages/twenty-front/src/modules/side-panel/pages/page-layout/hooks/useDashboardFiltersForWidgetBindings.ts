import { pageLayoutDraftFiltersComponentSelector } from '@/page-layout/states/selectors/pageLayoutDraftFiltersComponentSelector';
import { getDashboardFilterBindingItemId } from '@/side-panel/pages/page-layout/utils/getDashboardFilterBindingItemId';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from 'twenty-shared/types';
import {
  getEffectiveDashboardPageLayoutFilters,
  isDefined,
} from 'twenty-shared/utils';

export const useDashboardFiltersForWidgetBindings = ({
  pageLayoutId,
  objectMetadataId,
}: {
  pageLayoutId: string;
  objectMetadataId: string | null | undefined;
}) => {
  const isDashboardFiltersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
  );

  const pageLayoutFilters = useAtomComponentSelectorValue(
    pageLayoutDraftFiltersComponentSelector,
    pageLayoutId,
  );

  const bindablePageLayoutFilters =
    isDashboardFiltersEnabled && isDefined(objectMetadataId)
      ? getEffectiveDashboardPageLayoutFilters(pageLayoutFilters)
      : [];

  return {
    pageLayoutFilters: bindablePageLayoutFilters,
    dashboardFilterBindingItemIds: bindablePageLayoutFilters.map(({ id }) =>
      getDashboardFilterBindingItemId(id),
    ),
  };
};
