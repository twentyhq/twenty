import { useTabListStates } from '@/ui/layout/tab/hooks/internal/useTabListStates';
import { useRecoilState } from 'recoil';


export const useTabList = (tabListId?: string) => {
  const {
    activeTabIdState,
  } = useTabListStates({
    tabListScopeId: `${tabListId}-scope`,
  });

  const [activeTabId, setActiveTabId] = useRecoilState(activeTabIdState);

  return {
    activeTabId,
    setActiveTabId
  };
};
