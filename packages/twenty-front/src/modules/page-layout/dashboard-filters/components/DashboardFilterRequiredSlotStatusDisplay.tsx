import { PageLayoutWidgetStatusDisplay } from '@/page-layout/widgets/components/PageLayoutWidgetStatusDisplay';
import { t } from '@lingui/core/macro';
import { type DashboardFilterSlot } from 'twenty-shared/types';

type DashboardFilterRequiredSlotStatusDisplayProps = {
  widgetId: string;
  slot: DashboardFilterSlot;
};

export const DashboardFilterRequiredSlotStatusDisplay = ({
  widgetId,
  slot,
}: DashboardFilterRequiredSlotStatusDisplayProps) => (
  <PageLayoutWidgetStatusDisplay
    tooltipId={`widget-required-dashboard-filter-tooltip-${widgetId}`}
    text={t`Set the ${slot.label} filter`}
    tooltipContent={t`This dashboard filter is required: the chart loads once it has a value.`}
  />
);
