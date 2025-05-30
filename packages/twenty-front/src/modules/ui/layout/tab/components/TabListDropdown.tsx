import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';

import { MenuItemSelect } from 'twenty-ui/navigation';

import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SingleTabProps } from '@/ui/layout/tab/components/TabList';
import { TabMoreButton } from '@/ui/layout/tab/components/TabMoreButton';

type TabListDropdownProps = {
  dropdownId: string;
  handleDropdownClose: () => void;
  hiddenTabsCount: number;
  isActiveTabHidden: boolean;
  visibleTabs: SingleTabProps[];
  firstHiddenTabIndex: number;
  activeTabId: string | null;
  handleTabSelectFromDropdown: (tabId: string) => void;
  loading?: boolean;
};

export const TabListDropdown = ({
  dropdownId,
  handleDropdownClose,
  hiddenTabsCount,
  isActiveTabHidden,
  visibleTabs,
  firstHiddenTabIndex,
  activeTabId,
  handleTabSelectFromDropdown,
  loading,
}: TabListDropdownProps) => {
  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      onClickOutside={handleDropdownClose}
      dropdownOffset={{ x: 0, y: 8 }}
      clickableComponent={
        <TabMoreButton
          hiddenTabsCount={hiddenTabsCount}
          active={isActiveTabHidden}
        />
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            {visibleTabs.slice(firstHiddenTabIndex).map((tab) => (
              <MenuItemSelect
                key={tab.id}
                text={tab.title}
                LeftIcon={tab.Icon}
                selected={tab.id === activeTabId}
                onClick={() => handleTabSelectFromDropdown(tab.id)}
                disabled={tab.disabled ?? loading}
              />
            ))}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
      dropdownHotkeyScope={{ scope: dropdownId }}
    />
  );
};
