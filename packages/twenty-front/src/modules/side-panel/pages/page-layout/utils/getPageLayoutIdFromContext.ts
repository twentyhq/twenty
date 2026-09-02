export const getPageLayoutIdFromContext = ({
  isDashboardContext,
  dashboardPageLayoutId,
  currentPageLayoutId,
  recordPageLayoutId,
}: {
  isDashboardContext: boolean;
  dashboardPageLayoutId: string | null | undefined;
  currentPageLayoutId: string | null;
  recordPageLayoutId: string | undefined;
}) => {
  return isDashboardContext
    ? (dashboardPageLayoutId ?? currentPageLayoutId)
    : (recordPageLayoutId ?? null);
};
