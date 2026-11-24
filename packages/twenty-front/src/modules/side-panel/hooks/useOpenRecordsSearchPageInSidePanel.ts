import { useSearchOrAskLabel } from '@/side-panel/hooks/useSearchOrAskLabel';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { SidePanelPages } from 'twenty-shared/types';
import { IconSearch } from 'twenty-ui/icon';
import { v4 } from 'uuid';

export const useOpenRecordsSearchPageInSidePanel = () => {
  const searchOrAskLabel = useSearchOrAskLabel();
  const { navigateSidePanelMenu } = useSidePanelMenu();
  const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);

  const openRecordsSearchPage = () => {
    navigateSidePanelMenu({
      page: SidePanelPages.SearchRecords,
      pageTitle: searchOrAskLabel,
      pageIcon: IconSearch,
      pageId: v4(),
      resetNavigationStack: isSidePanelOpened,
    });
  };

  return {
    openRecordsSearchPage,
  };
};
