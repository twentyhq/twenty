import { type ReactNode } from 'react';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { navigationMenuItemEditSectionState } from '@/navigation-menu-item/common/states/navigationMenuItemEditSectionState';
import { NavigationMenuItemAddDropdownContent } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdownContent';

type NavigationMenuItemAddDropdownProps = {
  children: ReactNode;
  instanceId?: string;
  section?: 'workspace' | 'favorite';
} & (
  | { folderId: string; position: number }
  | { folderId?: never; position?: number }
);

export const NavigationMenuItemAddDropdown = ({
  children,
  instanceId = 'workspace',
  section = 'workspace',
  folderId,
  position,
}: NavigationMenuItemAddDropdownProps) => {
  const dropdownId = `navigation-add-item-${folderId ?? instanceId}`;
  const { closeDropdown } = useCloseDropdown();
  const setNavigationMenuItemEditSection = useSetAtomState(
    navigationMenuItemEditSectionState,
  );

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="right-start"
      clickableComponent={children}
      onOpen={() => {
        setNavigationMenuItemEditSection(section);
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
