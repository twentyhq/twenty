import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { SingleTabProps } from '@/ui/layout/tab/components/TabList';
import { TabMoreButton } from '@/ui/layout/tab/components/TabMoreButton';
import { useTheme } from '@emotion/react';
import { Avatar } from 'twenty-ui/display';
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
  const theme = useTheme();

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
              const avatar = tab.logo ? (
                <Avatar
                  avatarUrl={tab.logo}
                  size="md"
                  placeholder={tab.title}
                />
              ) : tab.Icon ? (
                <Avatar
                  Icon={tab.Icon}
                  size="md"
                  placeholder={tab.title}
                  iconColor={
                    tab.disabled
                      ? theme.font.color.tertiary
                      : theme.font.color.secondary
                  }
                />
              ) : null;
              return (
                <MenuItemSelectAvatar
                  key={tab.id}
                  text={tab.title}
                  avatar={avatar}
                  selected={tab.id === tabs.activeId}
                  onClick={isDisabled ? undefined : () => onTabSelect(tab.id)}
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
