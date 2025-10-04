import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { TabListOverflowDropdownDraggableContent } from '@/ui/layout/tab-list/components/TabListOverflowDropdownDraggableContent';
import { TabListOverflowDropdownStaticContent } from '@/ui/layout/tab-list/components/TabListOverflowDropdownStaticContent';
import { TabMoreButton } from '@/ui/layout/tab-list/components/TabMoreButton';
import { useTabListContextOrThrow } from '@/ui/layout/tab-list/contexts/TabListContext';

export const TabListDropdown = () => {
  const {
    dropdownId,
    overflow,
    onTabSelectFromDropdown,
    isDragAndDropEnabled,
  } = useTabListContextOrThrow();

  const { overflowCount, isActiveTabInOverflow } = overflow;

  const { closeDropdown } = useCloseDropdown();

  const handleClose = () => {
    closeDropdown(dropdownId);
  };

  const handleSelect = (tabId: string) => {
    onTabSelectFromDropdown(tabId);
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
          overflowCount={overflowCount}
          active={isActiveTabInOverflow}
        />
      }
      dropdownComponents={
        isDragAndDropEnabled ? (
          <TabListOverflowDropdownDraggableContent onSelect={handleSelect} />
        ) : (
          <TabListOverflowDropdownStaticContent onSelect={handleSelect} />
        )
      }
    />
  );
};
