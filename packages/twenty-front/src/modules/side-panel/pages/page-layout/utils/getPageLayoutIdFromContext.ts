import { CoreObjectNameSingular } from 'twenty-shared/types';

export const getPageLayoutIdFromContext = ({
  objectNameSingular,
  dashboardPageLayoutId,
  currentPageLayoutId,
  recordPageLayoutId,
}: {
  objectNameSingular: string;
  dashboardPageLayoutId: string | null | undefined;
  currentPageLayoutId: string | null;
  recordPageLayoutId: string | undefined;
}) => {
  return objectNameSingular === CoreObjectNameSingular.Dashboard
    ? (dashboardPageLayoutId ?? currentPageLayoutId)
    : (recordPageLayoutId ?? null);
};
