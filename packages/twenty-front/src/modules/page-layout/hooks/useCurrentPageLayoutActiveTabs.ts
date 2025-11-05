import { useCurrentPageLayout } from '@/page-layout/hooks/useCurrentPageLayout';

export const useCurrentPageLayoutActiveTabs = () => {
  const { currentPageLayout } = useCurrentPageLayout();

  const activeTab = currentPageLayout?.tabs.find((tab) => tab.id === tabId);

  return { activeTab };
};
