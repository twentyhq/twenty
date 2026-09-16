import { type ReactNode } from 'react';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { navigationMenuItemEditSectionState } from '@/navigation-menu-item/common/states/navigationMenuItemEditSectionState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { NavigationMenuItemAddDropdownContent } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdownContent';

type NavigationMenuItemAddDropdownProps = {
  children: ReactNode;
  folderId?: string;
  position?: number;
};

export const NavigationMenuItemAddDropdown = ({
  children,
  folderId,
  position,
}: NavigationMenuItemAddDropdownProps) => {
  const dropdownId = `navigation-add-item-${folderId ?? 'workspace'}`;
  const { closeDropdown } = useCloseDropdown();
  const setNavigationMenuItemEditSection = useSetAtomState(
    navigationMenuItemEditSectionState,
  );
  const setSelectedNavigationMenuItemIdInEditMode = useSetAtomState(
    selectedNavigationMenuItemIdInEditModeState,
  );

  return (
    <Dropdown
      dropdownId={dropdownId}
      excludedClickOutsideIds={[
        'navigation-new-folder-icon',
        'navigation-new-folder-icon-icon-color-picker',
      ]}
      dropdownPlacement="right-start"
      dropdownOffset={{ y: 8 }}
      clickableComponent={children}
      onOpen={() => {
        setNavigationMenuItemEditSection('workspace');
        setSelectedNavigationMenuItemIdInEditMode(null);
      }}
      dropdownComponents={
        <NavigationMenuItemAddDropdownContent
          dropdownId={dropdownId}
          folderId={folderId}
          position={position}
          onClose={() => closeDropdown(dropdownId)}
        />
      }
    />
  );
};
