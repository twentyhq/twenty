import { useCurrentPageLayoutOrThrow } from '@/page-layout/hooks/useCurrentPageLayoutOrThrow';
import { useUpdatePageLayoutTab } from '@/page-layout/hooks/useUpdatePageLayoutTab';
import { pageLayoutTabSettingsOpenTabIdComponentState } from '@/page-layout/states/pageLayoutTabSettingsOpenTabIdComponentState';
import { isReactivatableTab } from '@/page-layout/utils/isReactivatableTab';
import { sortTabsByPosition } from '@/page-layout/utils/sortTabsByPosition';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useMemo } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconPlus, useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type PageLayoutTabListNewTabDropdownContentProps = {
  onCreate: () => void;
  dropdownId: string;
};

export const PageLayoutTabListNewTabDropdownContent = ({
  onCreate,
  dropdownId,
}: PageLayoutTabListNewTabDropdownContentProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { closeDropdown } = useCloseDropdown();

  const { currentPageLayout } = useCurrentPageLayoutOrThrow();
  const { updatePageLayoutTab } = useUpdatePageLayoutTab();

  const setActiveTabId = useSetAtomComponentState(activeTabIdComponentState);
  const setPageLayoutTabSettingsOpenTabId = useSetAtomComponentState(
    pageLayoutTabSettingsOpenTabIdComponentState,
  );
  const { navigatePageLayoutSidePanel } = useNavigatePageLayoutSidePanel();

  const inactiveTabs = useMemo(
    () => sortTabsByPosition(currentPageLayout.tabs.filter(isReactivatableTab)),
    [currentPageLayout.tabs],
  );

  const handleCreateEmptyTab = useCallback(() => {
    onCreate();
    closeDropdown(dropdownId);
  }, [onCreate, closeDropdown, dropdownId]);

  const handleReactivateTab = useCallback(
    (tabId: string) => {
      updatePageLayoutTab(tabId, { isActive: true });
      setActiveTabId(tabId);
      setPageLayoutTabSettingsOpenTabId(tabId);
      navigatePageLayoutSidePanel({
        sidePanelPage: SidePanelPages.PageLayoutTabSettings,
        resetNavigationStack: true,
      });
      closeDropdown(dropdownId);
    },
    [
      updatePageLayoutTab,
      setActiveTabId,
      setPageLayoutTabSettingsOpenTabId,
      navigatePageLayoutSidePanel,
      closeDropdown,
      dropdownId,
    ],
  );

  return (
    <DropdownContent>
      <DropdownMenuHeader>{t`New tab`}</DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        <MenuItem
          LeftIcon={IconPlus}
          text={t`Empty tab`}
          onClick={handleCreateEmptyTab}
        />
      </DropdownMenuItemsContainer>
      {inactiveTabs.length > 0 && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuSectionLabel label={t`Disabled`} />
          <DropdownMenuItemsContainer>
            {inactiveTabs.map((tab) => (
              <MenuItem
                key={tab.id}
                LeftIcon={isDefined(tab.icon) ? getIcon(tab.icon) : undefined}
                text={tab.title}
                onClick={() => handleReactivateTab(tab.id)}
              />
            ))}
          </DropdownMenuItemsContainer>
        </>
      )}
    </DropdownContent>
  );
};
