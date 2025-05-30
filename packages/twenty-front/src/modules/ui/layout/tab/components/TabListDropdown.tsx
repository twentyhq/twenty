import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SingleTabProps } from '@/ui/layout/tab/components/TabList';
import { TabMoreButton } from '@/ui/layout/tab/components/TabMoreButton';
import { MenuItemSelect } from 'twenty-ui/navigation';

type TabListDropdownProps = {
  dropdownId: string;
  onClose: () => void;
  overflow: {
    hiddenTabsCount: number;
    isActiveTabHidden: boolean;
    firstHiddenTabIndex: number;
  };
  tabs: {
    visible: SingleTabProps[];
    activeId: string | null;
  };
  onTabSelect: (tabId: string) => void;
  loading?: boolean;
};

export const TabListDropdown = ({
  dropdownId,
  onClose,
  overflow,
  tabs,
  onTabSelect,
  loading,
}: TabListDropdownProps) => {
  const hiddenTabs = tabs.visible.slice(overflow.firstHiddenTabIndex);

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      onClickOutside={onClose}
      dropdownOffset={{ x: 0, y: 8 }}
      clickableComponent={
        <TabMoreButton
          hiddenTabsCount={overflow.hiddenTabsCount}
          active={overflow.isActiveTabHidden}
        />
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            {hiddenTabs.map((tab) => (
              <MenuItemSelect
                key={tab.id}
                text={tab.title}
                LeftIcon={tab.Icon}
                selected={tab.id === tabs.activeId}
                onClick={() => onTabSelect(tab.id)}
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
