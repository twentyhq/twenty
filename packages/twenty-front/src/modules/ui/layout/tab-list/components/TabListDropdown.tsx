import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { TabAvatar } from '@/ui/layout/tab-list/components/TabAvatar';
import { TabMoreButton } from '@/ui/layout/tab-list/components/TabMoreButton';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';

type TabListDropdownProps = {
  dropdownId: string;
  onClose: () => void;
  overflow: {
    hiddenTabsCount: number;
    isActiveTabHidden: boolean;
  };
  hiddenTabs: SingleTabProps[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  loading?: boolean;
};

export const TabListDropdown = ({
  dropdownId,
  onClose,
  overflow,
  hiddenTabs,
  activeTabId,
  onTabSelect,
  loading,
}: TabListDropdownProps) => {
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
                  selected={tab.id === activeTabId}
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
    />
  );
};
