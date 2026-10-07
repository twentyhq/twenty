import { PageLayoutWidgetStatusDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetStatusDisplay';
import { t } from '@lingui/core/macro';
import { type DashboardFilterSlot } from 'twenty-shared/types';

type DashboardFilterRequiredSlotStatusDisplayProps = {
  widgetId: string;
  slot: DashboardFilterSlot;
};

// Gray rather than the red of error states: the chart is fine, it is waiting for input.
export const DashboardFilterRequiredSlotStatusDisplay = ({
  widgetId,
  slot,
}: DashboardFilterRequiredSlotStatusDisplayProps) => (
  <PageLayoutWidgetStatusDisplay
    color="gray"
    tooltipId={`widget-required-dashboard-filter-tooltip-${widgetId}`}
    text={t`Set the ${slot.label} filter`}
    tooltipContent={t`This dashboard filter is required: the chart loads once it has a value.`}
  />
);
