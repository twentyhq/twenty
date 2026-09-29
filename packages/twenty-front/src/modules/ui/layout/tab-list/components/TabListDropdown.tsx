import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { TabAvatar } from '@/ui/layout/tab-list/components/TabAvatar';
import { TabMoreButton } from '@/ui/layout/tab-list/components/TabMoreButton';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
        <LegacyDropdownContent>
          <DropdownMenuItemsContainer>
            {hiddenTabs.map((tab) => {
              const isDisabled = tab.disabled ?? loading;

              return (
                <ListItem
                  key={tab.id}
                  onClick={
                    isDisabled
                      ? undefined
                      : () => {
                          onTabSelect(tab.id);
                          onClose();
                        }
                  }
                  disabled={isDisabled}
                  role="option"
                  aria-selected={tab.id === activeTabId}
                  selected={tab.id === activeTabId}
                  indicator="check"
                  startIcon={<TabAvatar tab={tab} />}
                >
                  {tab.title}
                </ListItem>
              );
            })}
          </DropdownMenuItemsContainer>
        </LegacyDropdownContent>
      }
    />
  );
};
