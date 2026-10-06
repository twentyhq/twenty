import { useDashboardFilterEditor } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterEditor';
import { dashboardFilterEditingSlotIdComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterEditingSlotIdComponentState';
import { DashboardFilterDetailContent } from '@/side-panel/pages/page-layout/components/dashboard-filters/DashboardFilterDetailContent';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const SidePanelDashboardFilterDetailSubPage = () => {
  const isDashboardFiltersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
  );

  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  if (!isDashboardFiltersEnabled || !isDefined(pageLayoutId)) {
    return null;
  }

  return <DashboardFilterDetailSubPageContent pageLayoutId={pageLayoutId} />;
};

const DashboardFilterDetailSubPageContent = ({
  pageLayoutId,
}: {
  pageLayoutId: string;
}) => {
  const dashboardFilterEditingSlotId = useAtomComponentStateValue(
    dashboardFilterEditingSlotIdComponentState,
    pageLayoutId,
  );

  const { pageLayoutDraft } = useDashboardFilterEditor(pageLayoutId);

  // Only custom slots are editable: the built-ins live in code until the dashboard goes custom.
  const slot = pageLayoutDraft.dashboardFilters?.find(
    (candidateSlot) => candidateSlot.id === dashboardFilterEditingSlotId,
  );

  if (!isDefined(slot)) {
    return null;
  }

  return (
    <DashboardFilterDetailContent pageLayoutId={pageLayoutId} slot={slot} />
  );
};
