import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { navigationMenuItemInsertionAnchorState } from '@/navigation-menu-item/common/states/navigationMenuItemInsertionAnchorState';
import { type ReactNode } from 'react';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { NavigationMenuItemAddDropdownContent } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdownContent';

type NavigationMenuItemAddDropdownProps = {
  children: ReactNode;
  instanceId?: string;
  section?: 'workspace' | 'favorite';
  onOpen?: () => void;
} & (
  | { folderId: string; position: number }
  | { folderId?: never; position?: number }
);

export const NavigationMenuItemAddDropdown = ({
  children,
  instanceId,
  section = 'workspace',
  folderId,
  position,
  onOpen,
}: NavigationMenuItemAddDropdownProps) => {
  const navigationMenuItemInsertionAnchor = useAtomStateValue(
    navigationMenuItemInsertionAnchorState,
  );
  const dropdownId = `navigation-add-item-${instanceId ?? folderId ?? 'workspace'}`;
  const { closeDropdown } = useCloseDropdown();

  return (
    <Dropdown
      dropdownId={dropdownId}
      positionReference={
        navigationMenuItemInsertionAnchor?.dropdownId === dropdownId
          ? navigationMenuItemInsertionAnchor.element
          : undefined
      }
      dropdownPlacement="right-start"
      onOpen={onOpen}
      clickableComponent={children}
      dropdownComponents={
        <NavigationMenuItemAddDropdownContent
          section={section}
          dropdownId={dropdownId}
          folderId={folderId}
          position={position}
          onClose={() => closeDropdown(dropdownId)}
        />
      }
    />
  );
};
