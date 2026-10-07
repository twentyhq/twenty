import { useDashboardFilterSlotsForPageLayout } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlotsForPageLayout';
import { pageLayoutEditingDashboardFilterSlotIdComponentState } from '@/page-layout/states/pageLayoutEditingDashboardFilterSlotIdComponentState';
import { SidePanelDashboardFilterDetailSubPageContent } from '@/side-panel/pages/page-layout/components/dashboard-filters/SidePanelDashboardFilterDetailSubPageContent';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { isDefined } from 'twenty-shared/utils';

export const SidePanelDashboardFilterDetailSubPage = () => {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  const pageLayoutEditingDashboardFilterSlotId = useAtomComponentStateValue(
    pageLayoutEditingDashboardFilterSlotIdComponentState,
    pageLayoutId,
  );

  const { slots, isUsingBuiltInSlots } =
    useDashboardFilterSlotsForPageLayout(pageLayoutId);

  const slot = slots.find(
    (slot) => slot.id === pageLayoutEditingDashboardFilterSlotId,
  );

  // Built-ins are not stored on the draft, so there is nothing to edit until the user adds a custom filter.
  if (!isDefined(slot) || isUsingBuiltInSlots) {
    return null;
  }

  return (
    <SidePanelDashboardFilterDetailSubPageContent
      pageLayoutId={pageLayoutId}
      slot={slot}
    />
  );
};
