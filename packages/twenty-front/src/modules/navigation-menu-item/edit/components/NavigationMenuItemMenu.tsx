import { type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { navigationMenuItemInsertionAnchorState } from '@/navigation-menu-item/common/states/navigationMenuItemInsertionAnchorState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { NavigationMenuItemAddDropdownContent } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdownContent';
import {
  Dropdown,
  type DropdownProps,
} from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export type NavigationMenuItemAddTarget = {
  folderId?: string;
  position?: number;
};

type NavigationMenuItemMenuProps = Pick<
  DropdownProps,
  | 'dropdownId'
  | 'clickableComponent'
  | 'disableClickForClickableComponent'
  | 'dropdownPlacement'
  | 'dropdownOffset'
  | 'excludedClickOutsideIds'
  | 'onClose'
> & {
  section: NavigationMenuItemSection;
  renderMenu: (controls: {
    onClose: () => void;
    onAdd: (target: NavigationMenuItemAddTarget) => void;
  }) => ReactNode;
};

export const NavigationMenuItemMenu = ({
  section,
  dropdownId,
  renderMenu,
  onClose,
  dropdownPlacement = 'right-start',
  dropdownOffset,
  clickableComponent,
  disableClickForClickableComponent,
  excludedClickOutsideIds,
}: NavigationMenuItemMenuProps) => {
  const [addTarget, setAddTarget] =
    useState<NavigationMenuItemAddTarget | null>(null);
  const navigationMenuItemInsertionAnchor = useAtomStateValue(
    navigationMenuItemInsertionAnchorState,
  );
  const setOpenNavigationMenuItemFolderIds = useSetAtomState(
    openNavigationMenuItemFolderIdsState,
  );
  const { closeDropdown } = useCloseDropdown();
  const close = () => closeDropdown(dropdownId);
  const openAddMenu = (target: NavigationMenuItemAddTarget) => {
    const { folderId } = target;
    if (isDefined(folderId)) {
      setOpenNavigationMenuItemFolderIds((folderIds) =>
        folderIds.includes(folderId) ? folderIds : [...folderIds, folderId],
      );
    }
    setAddTarget(target);
  };

  return (
    <Dropdown
      clickableComponent={clickableComponent}
      disableClickForClickableComponent={disableClickForClickableComponent}
      excludedClickOutsideIds={excludedClickOutsideIds}
      dropdownId={dropdownId}
      dropdownPlacement={
        isDefined(addTarget) ? 'right-start' : dropdownPlacement
      }
      dropdownOffset={isDefined(addTarget) ? undefined : dropdownOffset}
      positionReference={
        isDefined(addTarget) &&
        navigationMenuItemInsertionAnchor?.dropdownId === dropdownId
          ? navigationMenuItemInsertionAnchor.element
          : undefined
      }
      onClose={() => {
        setAddTarget(null);
        onClose?.();
      }}
      dropdownComponents={
        isDefined(addTarget) ? (
          <NavigationMenuItemAddDropdownContent
            folderId={addTarget.folderId}
            position={addTarget.position}
            section={section}
            dropdownId={dropdownId}
            onClose={close}
          />
        ) : (
          renderMenu({ onClose: close, onAdd: openAddMenu })
        )
      }
    />
  );
};
