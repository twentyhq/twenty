export const getDashboardFilterChipInstanceId = ({
  pageLayoutId,
  slotId,
}: {
  pageLayoutId: string;
  slotId: string;
}) => `dashboard-filter-${pageLayoutId}-${slotId}`;
