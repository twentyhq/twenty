import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { type ReactNode } from 'react';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { navigationMenuItemEditSectionState } from '@/navigation-menu-item/common/states/navigationMenuItemEditSectionState';
import { NavigationMenuItemAddDropdownContent } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdownContent';

type NavigationMenuItemAddDropdownProps = {
  children: ReactNode;
} & (
  | { folderId: string; position: number }
  | { folderId?: never; position?: never }
);

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

  const setPendingInsertionNavigationMenuItem = useSetAtomState(
    pendingInsertionNavigationMenuItemState,
  );

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      dropdownOffset={{ y: 8 }}
      clickableComponent={children}
      onOpen={() => {
        setNavigationMenuItemEditSection('workspace');
        setPendingInsertionNavigationMenuItem(
          folderId ? { folderId, position } : null,
        );
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
