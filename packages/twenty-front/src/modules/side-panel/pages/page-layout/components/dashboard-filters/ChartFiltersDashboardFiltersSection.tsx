import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useDashboardFilterSlotsForPageLayout } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterSlotsForPageLayout';
import { getDashboardFilterBindingLabel } from '@/page-layout/dashboard-filters/utils/getDashboardFilterBindingLabel';
import { pageLayoutEditingDashboardFilterSlotIdComponentState } from '@/page-layout/states/pageLayoutEditingDashboardFilterSlotIdComponentState';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { type ChartWidget } from '@/side-panel/pages/page-layout/types/ChartWidget';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { type DashboardFilterSlot } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconFilter } from 'twenty-ui/icon';

type ChartFiltersDashboardFiltersSectionProps = {
  pageLayoutId: string;
  widget: ChartWidget;
};

// Read-only from the chart's point of view: each row jumps to the slot editor where bindings change.
export const ChartFiltersDashboardFiltersSection = ({
  pageLayoutId,
  widget,
}: ChartFiltersDashboardFiltersSectionProps) => {
  const { t } = useLingui();

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const { slots, bindingsByWidgetId, isUsingBuiltInSlots } =
    useDashboardFilterSlotsForPageLayout(pageLayoutId);

  const setPageLayoutEditingDashboardFilterSlotId = useSetAtomComponentState(
    pageLayoutEditingDashboardFilterSlotIdComponentState,
    pageLayoutId,
  );

  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();

  if (slots.length === 0) {
    return null;
  }

  const handleSlotClick = (slot: DashboardFilterSlot) => {
    setPageLayoutEditingDashboardFilterSlotId(slot.id);
    navigateToSidePanelSubPage(
      SidePanelSubPages.PageLayoutDashboardFilterDetail,
      slot.label,
    );
  };

  return (
    <div>
      <InputLabel>{t`Dashboard filters`}</InputLabel>
      {slots.map((slot) => {
        const binding = bindingsByWidgetId[widget.id]?.[slot.id];

        const bindingLabel = isDefined(binding)
          ? getDashboardFilterBindingLabel({ binding, objectMetadataItems })
          : t`Not applied`;

        return (
          <CommandMenuItem
            key={slot.id}
            id={`chart-dashboard-filter-${slot.id}`}
            Icon={IconFilter}
            label={`${slot.label} → ${bindingLabel}`}
            hasSubMenu={!isUsingBuiltInSlots}
            disabled={isUsingBuiltInSlots}
            onClick={
              isUsingBuiltInSlots ? undefined : () => handleSlotClick(slot)
            }
          />
        );
      })}
    </div>
  );
};
