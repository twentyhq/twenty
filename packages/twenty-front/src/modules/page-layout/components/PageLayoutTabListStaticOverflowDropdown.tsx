import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { TabAvatar } from '@/ui/layout/tab-list/components/TabAvatar';
import { TabMoreButton } from '@/ui/layout/tab-list/components/TabMoreButton';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';

type PageLayoutTabListStaticOverflowDropdownProps = {
  dropdownId: string;
  hiddenTabs: SingleTabProps[];
  hiddenTabsCount: number;
  isActiveTabHidden: boolean;
  activeTabId: string | null;
  loading?: boolean;
  onSelect: (tabId: string) => void;
  onClose: () => void;
};

export const PageLayoutTabListStaticOverflowDropdown = ({
  dropdownId,
  hiddenTabs,
  hiddenTabsCount,
  isActiveTabHidden,
  activeTabId,
  loading,
  onSelect,
  onClose,
}: PageLayoutTabListStaticOverflowDropdownProps) => {
  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      dropdownOffset={{ x: 0, y: 8 }}
      onClickOutside={onClose}
      clickableComponent={
        <TabMoreButton
          hiddenTabsCount={hiddenTabsCount}
          active={isActiveTabHidden}
        />
      }
      dropdownComponents={
        <DropdownContent>
          <DropdownMenuItemsContainer>
            {hiddenTabs.map((tab) => {
              const disabled = tab.disabled ?? loading;

              return (
                <MenuItemSelectAvatar
                  key={tab.id}
                  text={tab.title}
                  avatar={<TabAvatar tab={tab} />}
                  selected={tab.id === activeTabId}
                  onClick={
                    disabled
                      ? undefined
                      : () => {
                          onSelect(tab.id);
                          onClose();
                        }
                  }
                  disabled={disabled}
                />
              );
            })}
          </DropdownMenuItemsContainer>
        </DropdownContent>
      }
    />
  );
};
