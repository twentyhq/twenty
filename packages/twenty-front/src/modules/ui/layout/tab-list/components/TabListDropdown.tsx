import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { TabMoreButton } from '@/ui/layout/tab-list/components/TabMoreButton';
import { useTabListStateContextOrThrow } from '../contexts/TabListStateContext';
import { TabListOverflowDropdownDraggableContent } from './TabListOverflowDropdownDraggableContent';
import { TabListOverflowDropdownStaticContent } from './TabListOverflowDropdownStaticContent';

export const TabListDropdown = () => {
  const {
    dropdownId,
    overflow,
    onTabSelectFromDropdown,
    isDragAndDropEnabled,
  } = useTabListStateContextOrThrow();

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
