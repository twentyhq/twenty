import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { SidePanelNewSidebarItemMainMenu } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNewSidebarItemMainMenu';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';

export const SidePanelNewSidebarItemPage = () => {
  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();

  return (
    <SidePanelNewSidebarItemMainMenu
      onSelectRecord={() =>
        navigateToSidePanelSubPage(SidePanelSubPages.NewSidebarItemRecord)
      }
      onSelectObject={() =>
        navigateToSidePanelSubPage(SidePanelSubPages.NewSidebarItemObjectPicker)
      }
      onSelectView={() =>
        navigateToSidePanelSubPage(
          SidePanelSubPages.NewSidebarItemViewObjectPicker,
        )
      }
    />
  );
};
