export const getPageLayoutIdFromContext = <TDashboardPageLayoutId>({
  isDashboardContext,
  dashboardPageLayoutId,
  currentPageLayoutId,
  recordPageLayoutId,
}: {
  isDashboardContext: boolean;
  dashboardPageLayoutId: TDashboardPageLayoutId;
  currentPageLayoutId: string | null;
  recordPageLayoutId: string | undefined;
}) => {
  return isDashboardContext
    ? (dashboardPageLayoutId ?? currentPageLayoutId)
    : (recordPageLayoutId ?? null);
};
