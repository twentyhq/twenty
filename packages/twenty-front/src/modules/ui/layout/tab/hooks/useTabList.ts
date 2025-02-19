import { useRecoilState } from 'recoil';

import { useTabListStates } from '@/ui/layout/tab/hooks/internal/useTabListStates';

export const useTabList = (tabListId?: string) => {
  const { activeTabIdState } = useTabListStates({
    tabListScopeId: tabListId,
  });

  const [activeTabId, setActiveTabId] = useRecoilState(activeTabIdState);

  return {
    activeTabId,
    setActiveTabId,
  };
};
