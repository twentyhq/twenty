import { usePageLayoutContentContext } from '@/page-layout/contexts/PageLayoutContentContext';
import { usePageLayoutRenderableTabs } from '@/page-layout/hooks/usePageLayoutRenderableTabs';
import { isDefined } from 'twenty-shared/utils';

export const useIsInPinnedTab = () => {
  const { tabId } = usePageLayoutContentContext();

  const { pinnedLeftTab } = usePageLayoutRenderableTabs();

  return {
    isInPinnedTab: isDefined(pinnedLeftTab) && pinnedLeftTab.id === tabId,
  };
};
