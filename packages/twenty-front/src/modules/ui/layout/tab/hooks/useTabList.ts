import { useTabListStates } from '@/ui/layout/tab/hooks/internal/useTabListStates';
import { useSetRecoilState } from 'recoil';

export const useTabList = (tabListId?: string) => {
  const { activeTabIdState } = useTabListStates({
    tabListScopeId: `${tabListId}-scope`,
  });

  const setActiveTabId = useSetRecoilState(activeTabIdState);

  return {
    activeTabIdState,
    setActiveTabId,
  };
};
