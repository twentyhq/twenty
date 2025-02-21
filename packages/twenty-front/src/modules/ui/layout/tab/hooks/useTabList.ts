import { RecoilState, useRecoilState } from 'recoil';

import { useTabListStates } from '@/ui/layout/tab/hooks/internal/useTabListStates';

export const useTabList = <T extends string>(tabListId?: string) => {
  const { activeTabIdState } = useTabListStates({
    tabListScopeId: tabListId,
  });

  const [activeTabId, setActiveTabId] = useRecoilState(
    activeTabIdState as RecoilState<T | null>,
  );

  return {
    activeTabId,
    setActiveTabId,
  };
};
