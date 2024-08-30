import { useSetRecoilState } from 'recoil';

import { useTabListStates } from '@/ui/layout/tab/hooks/internal/useTabListStates';

export const useTabList = (tabListId?: string) => {
  const { activeTabIdState } = useTabListStates({
    tabListScopeId: tabListId,
  });

  const setActiveTabId = useSetRecoilState(activeTabIdState);

  return {
    activeTabIdState,
    setActiveTabId,
  };
};
