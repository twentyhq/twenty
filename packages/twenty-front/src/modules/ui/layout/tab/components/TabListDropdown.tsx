import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { TabAvatar } from '@/ui/layout/tab/components/TabAvatar';
import { SingleTabProps } from '@/ui/layout/tab/components/TabList';
import { TabMoreButton } from '@/ui/layout/tab/components/TabMoreButton';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';

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
            {hiddenTabs.map((tab) => {
              const isDisabled = tab.disabled ?? loading;

              return (
                <MenuItemSelectAvatar
                  key={tab.id}
                  text={tab.title}
                  avatar={<TabAvatar tab={tab} />}
                  selected={tab.id === tabs.activeId}
                  onClick={
                    isDisabled
                      ? undefined
                      : () => {
                          onTabSelect(tab.id);
                          onClose();
                        }
                  }
                  disabled={isDisabled}
                />
              );
            })}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
      dropdownHotkeyScope={{ scope: dropdownId }}
    />
  );
};
