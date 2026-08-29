import { useAtomValue } from 'jotai';
import { SidePanelPages } from 'twenty-shared/types';

import { sidePanelRoutedPagePathComponentState } from '@/side-panel/routing/states/sidePanelRoutedPagePathComponentState';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCurrentSidePanelRoutedPath = () => {
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const sidePanelPageInfo = useAtomStateValue(sidePanelPageInfoState);

  // Read straight off the family rather than through
  // useAtomComponentStateValue: this runs above the panel, where there is no
  // page instance context, and the panel carries an empty instance id until
  // something opens in it.
  const sidePanelRoutedPagePath = useAtomValue(
    sidePanelRoutedPagePathComponentState.atomFamily({
      instanceId: sidePanelPageInfo.instanceId,
    }),
  );

  if (sidePanelPage !== SidePanelPages.RoutedPage) {
    return null;
  }

  return sidePanelRoutedPagePath;
};
