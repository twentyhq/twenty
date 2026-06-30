import { useCallback } from 'react';
import { v4 } from 'uuid';

import { sidePanelSubPageStackComponentState } from '@/side-panel/states/sidePanelSubPageStackComponentState';
import { type SidePanelSubPageEntry } from '@/side-panel/types/SidePanelSubPageEntry';
import { type SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { getSidePanelSubPageTitle } from '@/side-panel/utils/getSidePanelSubPageTitle';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { isDefined } from 'twenty-shared/utils';

export const useSidePanelSubPageHistory = () => {
  const [sidePanelSubPageStack, setSidePanelSubPageStack] =
    useAtomComponentState(sidePanelSubPageStackComponentState);

  const currentSidePanelSubPage: SidePanelSubPageEntry | undefined =
    sidePanelSubPageStack.at(-1);

  const hasSidePanelSubPages = isDefined(currentSidePanelSubPage);

  const navigateToSidePanelSubPage = useCallback(
    (subPage: SidePanelSubPages, titleOverride?: string) => {
      const title = isDefined(titleOverride)
        ? titleOverride
        : getSidePanelSubPageTitle(subPage);

      setSidePanelSubPageStack((currentStack) => [
        ...currentStack,
        { id: v4(), subPage, title },
      ]);
    },
    [setSidePanelSubPageStack],
  );

  const goBackFromSidePanelSubPage = useCallback(() => {
    setSidePanelSubPageStack((currentStack) => currentStack.slice(0, -1));
  }, [setSidePanelSubPageStack]);

  const resetSidePanelSubPages = useCallback(() => {
    setSidePanelSubPageStack([]);
  }, [setSidePanelSubPageStack]);

  return {
    navigateToSidePanelSubPage,
    goBackFromSidePanelSubPage,
    resetSidePanelSubPages,
    currentSidePanelSubPage,
    sidePanelSubPageStack,
    hasSidePanelSubPages,
  };
};
