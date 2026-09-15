import { isNonEmptyString } from '@sniptt/guards';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { useSidePanelSubPageHistory } from '@/side-panel/hooks/useSidePanelSubPageHistory';
import { SidePanelNewSidebarItemMainMenu } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNewSidebarItemMainMenu';
import { SidePanelNewSidebarItemSearchResults } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNewSidebarItemSearchResults';
import { SidePanelSubViewWithSearch } from '@/side-panel/components/SidePanelSubViewWithSearch';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';

export const SidePanelNewSidebarItemPage = () => {
  const { t } = useLingui();
  const { navigateToSidePanelSubPage } = useSidePanelSubPageHistory();
  const [searchValue, setSearchValue] = useState('');
  const trimmedSearchValue = searchValue.trim();
  const hasSearchQuery = isNonEmptyString(trimmedSearchValue);

  return (
    <SidePanelSubViewWithSearch
      searchPlaceholder={t`Search a nav item...`}
      searchValue={searchValue}
      onSearchChange={setSearchValue}
    >
      {hasSearchQuery ? (
        <SidePanelNewSidebarItemSearchResults
          searchValue={trimmedSearchValue}
        />
      ) : (
        <SidePanelNewSidebarItemMainMenu
          onSelectRecord={() =>
            navigateToSidePanelSubPage(SidePanelSubPages.NewSidebarItemRecord)
          }
          onSelectObject={() =>
            navigateToSidePanelSubPage(
              SidePanelSubPages.NewSidebarItemObjectPicker,
            )
          }
          onSelectView={() =>
            navigateToSidePanelSubPage(
              SidePanelSubPages.NewSidebarItemViewObjectPicker,
            )
          }
        />
      )}
    </SidePanelSubViewWithSearch>
  );
};
