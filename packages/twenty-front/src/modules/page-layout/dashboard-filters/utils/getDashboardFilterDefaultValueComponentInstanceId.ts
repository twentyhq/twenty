// Distinct from the bar chip's instance: both are mounted while a dashboard is edited and must not share filter inputs state.
export const getDashboardFilterDefaultValueComponentInstanceId = ({
  pageLayoutId,
  slotId,
}: {
  pageLayoutId: string;
  slotId: string;
}) => `dashboard-filter-default-value-${pageLayoutId}-${slotId}`;
