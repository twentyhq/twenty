import { useDebouncedCallback } from 'use-debounce';

import { PAGE_LAYOUT_TAB_PRERENDER_HOVER_INTENT_DELAY_MS } from '@/page-layout/constants/PageLayoutTabPrerenderHoverIntentDelayMs';
import { usePrerenderPageLayoutTab } from '@/page-layout/hooks/usePrerenderPageLayoutTab';

export const usePrerenderPageLayoutTabOnHover = () => {
  const { prerenderPageLayoutTab } = usePrerenderPageLayoutTab();

  const debouncedPrerenderPageLayoutTab = useDebouncedCallback(
    prerenderPageLayoutTab,
    PAGE_LAYOUT_TAB_PRERENDER_HOVER_INTENT_DELAY_MS,
  );

  const handleTabMouseEnter = (tabId: string) => {
    debouncedPrerenderPageLayoutTab(tabId);
  };

  const handleTabMouseLeave = () => {
    debouncedPrerenderPageLayoutTab.cancel();
  };

  return { handleTabMouseEnter, handleTabMouseLeave };
};
