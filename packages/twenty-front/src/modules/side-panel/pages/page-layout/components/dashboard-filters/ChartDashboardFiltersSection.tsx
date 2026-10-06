import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useDashboardFilterEditor } from '@/page-layout/dashboard-filters/hooks/useDashboardFilterEditor';
import { dashboardFilterEditingSlotIdComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterEditingSlotIdComponentState';
import { getDashboardFilterBindingLabel } from '@/page-layout/dashboard-filters/utils/getDashboardFilterBindingLabel';
import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { type ChartWidget } from '@/side-panel/pages/page-layout/types/ChartWidget';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { InputLabel } from '@/ui/input/components/internal/InputLabel/InputLabel';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/components/navigation';
import { IconFilter } from 'twenty-ui/icon';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type ChartDashboardFiltersSectionProps = {
  pageLayoutId: string;
  widget: ChartWidget;
};

// Read-only here: a binding is a property of the slot, edited from the slot's own page so the other charts stay in view.
export const ChartDashboardFiltersSection = ({
  pageLayoutId,
  widget,
}: ChartDashboardFiltersSectionProps) => {
  const isDashboardFiltersEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
  );

  const { slots, bindingsByWidgetId, isUsingBuiltInFilters } =
    useDashboardFilterEditor(pageLayoutId);

  const { objectMetadataItems } = useObjectMetadataItems();

  const setDashboardFilterEditingSlotId = useSetAtomComponentState(
    dashboardFilterEditingSlotIdComponentState,
    pageLayoutId,
  );

  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();

  if (!isDashboardFiltersEnabled) {
    return null;
  }

  const widgetBindings = bindingsByWidgetId[widget.id] ?? {};

  const boundSlots = slots.flatMap((slot) => {
    const binding = widgetBindings[slot.id];

    if (!isDefined(binding)) {
      return [];
    }

    const bindingLabel = getDashboardFilterBindingLabel({
      binding,
      objectMetadataItems,
    });

    return isDefined(bindingLabel) ? [{ slot, bindingLabel }] : [];
  });

  if (boundSlots.length === 0) {
    return null;
  }

  const openSlotDetail = (slotId: string) => {
    setDashboardFilterEditingSlotId(slotId);
    navigateToSidePanelSubPage(
      SidePanelSubPages.PageLayoutDashboardFilterDetail,
    );
  };

  return (
    <div>
      <InputLabel>{t`Dashboard filters`}</InputLabel>
      {boundSlots.map(({ slot, bindingLabel }) => (
        <MenuItem
          key={slot.id}
          LeftIcon={IconFilter}
          text={`${slot.label} → ${bindingLabel}`}
          hasSubMenu={!isUsingBuiltInFilters}
          onClick={
            isUsingBuiltInFilters ? undefined : () => openSlotDetail(slot.id)
          }
        />
      ))}
    </div>
  );
};
