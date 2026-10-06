export const getDashboardFilterChipComponentInstanceId = ({
  pageLayoutInstanceId,
  slotId,
}: {
  pageLayoutInstanceId: string;
  slotId: string;
}) => `dashboard-filter-${pageLayoutInstanceId}-${slotId}`;
