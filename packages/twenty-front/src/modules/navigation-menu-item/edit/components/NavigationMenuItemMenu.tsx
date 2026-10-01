import { NavigationMenuItemMenuModeEffect } from '@/navigation-menu-item/edit/effect-components/NavigationMenuItemMenuModeEffect';
import { type ComponentProps, type ReactElement, type ReactNode } from 'react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { useTheme } from 'twenty-ui/theme';

import { navigationMenuItemInsertionAnchorState } from '@/navigation-menu-item/common/states/navigationMenuItemInsertionAnchorState';
import { openNavigationMenuItemFolderIdsState } from '@/navigation-menu-item/common/states/openNavigationMenuItemFolderIdsState';
import { type NavigationMenuItemSection } from '@/navigation-menu-item/common/types/NavigationMenuItemSection';
import { NavigationMenuItemAddDropdownContent } from '@/navigation-menu-item/edit/components/NavigationMenuItemAddDropdownContent';
import { type NavigationMenuItemAddTarget } from '@/navigation-menu-item/edit/types/NavigationMenuItemAddTarget';
import { type NavigationMenuItemMenuMode } from '@/navigation-menu-item/edit/types/NavigationMenuItemMenuMode';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

type NavigationMenuItemMenuProps = {
  dropdownId: string;
  section: NavigationMenuItemSection;
  children?: ReactNode;
  trigger?: ReactElement;
  anchor?: ComponentProps<typeof DropdownContent>['anchor'];
  side?: ComponentProps<typeof DropdownContent>['side'];
  mode: NavigationMenuItemMenuMode;
  onModeChange: (mode: NavigationMenuItemMenuMode) => void;
  onOpen?: () => void;
  onClose?: () => void;
  renderMenu: (controls: {
    onClose: () => void;
    onAdd: (target: NavigationMenuItemAddTarget) => void;
  }) => ReactNode;
};

export const NavigationMenuItemMenu = ({
  section,
  dropdownId,
  renderMenu,
  mode,
  onModeChange,
  onOpen,
  onClose,
  anchor,
  side = 'right',
  trigger,
  children,
}: NavigationMenuItemMenuProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const navigationMenuItemInsertionAnchor = useAtomStateValue(
    navigationMenuItemInsertionAnchorState,
  );
  const setOpenNavigationMenuItemFolderIds = useSetAtomState(
    openNavigationMenuItemFolderIdsState,
  );
  const { closeDropdown } = useCloseDropdown();
  const close = () => closeDropdown(dropdownId);
  const isAdding = mode.type === 'add';
  const isEditing = mode.type === 'edit';
  const menuAriaLabel = isEditing ? t`Edit link` : t`Menu item actions`;
  const openAddMenu = (target: NavigationMenuItemAddTarget) => {
    const { folderId } = target;

    if (isDefined(folderId)) {
      setOpenNavigationMenuItemFolderIds((folderIds) =>
        folderIds.includes(folderId) ? folderIds : [...folderIds, folderId],
      );
    }

    onModeChange({ type: 'add', ...target });
  };

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type={isAdding ? 'picker' : isEditing ? 'panel' : 'menu'}
      onOpenChange={(open) => {
        if (open) {
          onOpen?.();
          return;
        }

        onClose?.();
      }}
      onInteractOutside={(event) => {
        const isOnRowActions = isDefined(
          event.target?.closest(
            `[data-navigation-menu-item-id="${dropdownId}"] [data-navigation-actions]`,
          ),
        );

        if (isOnRowActions) {
          return;
        }

        const isInsideRowPopup = [
          `${dropdownId}-icon`,
          `${dropdownId}-icon-icon-color-picker`,
          `${dropdownId}-color`,
        ].some((popupId) =>
          isDefined(
            event.target?.closest(`[data-click-outside-id="${popupId}"]`),
          ),
        );
        const isInsideRow = isDefined(
          event.target?.closest(
            `[data-navigation-menu-item-id="${dropdownId}"]`,
          ),
        );

        if (isEditing || isInsideRow || isInsideRowPopup) {
          event.preventDefault();
        }
      }}
    >
      <NavigationMenuItemMenuModeEffect mode={mode.type} />
      {isDefined(trigger) && <Dropdown.Trigger render={trigger} />}
      {children}
      <DropdownContent
        side={isAdding ? 'right' : isEditing ? 'top' : side}
        align="start"
        sideOffset={isEditing ? theme.spacingMultiplicator : undefined}
        anchor={
          isAdding &&
          navigationMenuItemInsertionAnchor?.dropdownId === dropdownId
            ? navigationMenuItemInsertionAnchor.element
            : anchor
        }
        width={
          isAdding || isEditing
            ? GenericDropdownContentWidth.ExtraLarge
            : GenericDropdownContentWidth.Large
        }
        aria-label={isAdding ? undefined : menuAriaLabel}
      >
        {mode.type === 'add' ? (
          <NavigationMenuItemAddDropdownContent
            folderId={mode.folderId}
            position={mode.position}
            section={section}
            dropdownId={dropdownId}
            onClose={close}
          />
        ) : (
          renderMenu({ onClose: close, onAdd: openAddMenu })
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};
