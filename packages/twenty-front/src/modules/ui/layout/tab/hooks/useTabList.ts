import { useSetRecoilState } from 'recoil';

import { useTabListStates } from '@/ui/layout/tab/hooks/internal/useTabListStates';

export const useTabList = (tabListId?: string) => {
  const { getActiveTabIdState } = useTabListStates({
    tabListScopeId: `${tabListId}-scope`,
  });

  const setActiveTabId = useSetRecoilState(getActiveTabIdState());

  return {
    getActiveTabIdState,
    setActiveTabId,
  };
};
