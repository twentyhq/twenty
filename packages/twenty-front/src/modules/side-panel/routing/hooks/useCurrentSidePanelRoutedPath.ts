import { useStore } from 'jotai';
import { SidePanelPages } from 'twenty-shared/types';

import { sidePanelRoutedPagePathComponentState } from '@/side-panel/routing/states/sidePanelRoutedPagePathComponentState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCurrentSidePanelRoutedPath = () => {
  const store = useStore();
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const sidePanelPageInfo = useAtomStateValue(sidePanelPageInfoState);

  if (sidePanelPage !== SidePanelPages.RoutedPage) {
    return null;
  }

  return store.get(
    sidePanelRoutedPagePathComponentState.atomFamily({
      instanceId: sidePanelPageInfo.instanceId,
    }),
  );
};
