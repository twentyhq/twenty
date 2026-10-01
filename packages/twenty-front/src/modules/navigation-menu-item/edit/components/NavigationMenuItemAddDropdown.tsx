import { type ReactElement } from 'react';
import { Dropdown } from 'twenty-ui/components';

import { navigationMenuItemInsertionAnchorState } from '@/navigation-menu-item/common/states/navigationMenuItemInsertionAnchorState';
import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { NavigationMenuItemAddDropdownContent } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdownContent';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuItemAddDropdownProps = {
  children: ReactElement;
  instanceId?: string;
  section?: NavigationMenuItemSection;
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
    <DropdownRoot
      dropdownId={dropdownId}
      type="picker"
      onOpenChange={(open) => {
        if (open) {
          onOpen?.();
        }
      }}
    >
      <Dropdown.Trigger
        nativeButton={false}
        render={<div tabIndex={-1}>{children}</div>}
      />
      <DropdownContent
        anchor={
          navigationMenuItemInsertionAnchor?.dropdownId === dropdownId
            ? navigationMenuItemInsertionAnchor.element
            : undefined
        }
        side="right"
        align="start"
        width={GenericDropdownContentWidth.ExtraLarge}
      >
        <NavigationMenuItemAddDropdownContent
          section={section}
          dropdownId={dropdownId}
          folderId={folderId}
          position={position}
          onClose={() => closeDropdown(dropdownId)}
        />
      </DropdownContent>
    </DropdownRoot>
  );
};
