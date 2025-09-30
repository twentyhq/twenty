import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { TabMoreButton } from '@/ui/layout/tab-list/components/TabMoreButton';
import { TabListDropdownDraggableContent } from './TabListDropdownDraggableContent';
import { TabListDropdownStaticContent } from './TabListDropdownStaticContent';

type TabListDropdownProps = {
  dropdownId: string;
  overflow: {
    hiddenTabsCount: number;
    isActiveTabHidden: boolean;
  };
  hiddenTabs: SingleTabProps[];
  activeTabId: string | null;
  onTabSelect: (tabId: string) => void;
  loading?: boolean;
  isDraggable?: boolean;
  visibleTabCount: number;
};

export const TabListDropdown = ({
  dropdownId,
  overflow,
  hiddenTabs,
  activeTabId,
  onTabSelect,
  loading,
  isDraggable,
  visibleTabCount,
}: TabListDropdownProps) => {
  const { closeDropdown } = useCloseDropdown();

  const handleClose = () => {
    closeDropdown(dropdownId);
  };

  const handleSelect = (tabId: string) => {
    onTabSelect(tabId);
    handleClose();
  };

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      onClickOutside={handleClose}
      dropdownOffset={{ x: 0, y: 8 }}
      clickableComponent={
        <TabMoreButton
          hiddenTabsCount={overflow.hiddenTabsCount}
          active={overflow.isActiveTabHidden}
        />
      }
      dropdownComponents={
        isDraggable ? (
          <TabListDropdownDraggableContent
            hiddenTabs={hiddenTabs}
            activeTabId={activeTabId}
            loading={loading}
            onSelect={handleSelect}
            visibleTabCount={visibleTabCount}
          />
        ) : (
          <TabListDropdownStaticContent
            hiddenTabs={hiddenTabs}
            activeTabId={activeTabId}
            loading={loading}
            onSelect={handleSelect}
          />
        )
      }
    />
  );
};
