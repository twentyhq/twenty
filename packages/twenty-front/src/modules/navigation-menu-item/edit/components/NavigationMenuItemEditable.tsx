import { NavigationMenuItemObjectColorEditor } from '@/navigation-menu-item/edit/components/NavigationMenuItemObjectColorEditor';
import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
// Aliased so both reads satisfy the matching-state-variable lint rule, which
// requires the variable to be named after the state it reads.
import {
  isDropdownOpenComponentState,
  isDropdownOpenComponentState as isColorPickerOpenComponentState,
} from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useCallback, useState, type ReactNode } from 'react';
import { styled } from '@linaria/react';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { NavigationMenuItemMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemMenu';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { NavigationMenuItemActions } from '@/navigation-menu-item/edit/components/NavigationMenuItemActions';
import { NavigationMenuItemRowActions } from '@/navigation-menu-item/edit/components/NavigationMenuItemRowActions';
import { NavigationMenuItemTypeTooltip } from '@/navigation-menu-item/edit/components/NavigationMenuItemTypeTooltip';
import { NavigationMenuItemLinkEditorOpenEffect } from '@/navigation-menu-item/edit/effect-components/NavigationMenuItemLinkEditorOpenEffect';
import { NavigationMenuItemLinkEditor } from '@/navigation-menu-item/edit/components/NavigationMenuItemLinkEditor';
import { NavigationMenuItemInlineEditor } from '@/navigation-menu-item/edit/components/NavigationMenuItemInlineEditor';

const StyledRow = styled.div`
  min-width: 0;
  position: relative;

  &:hover .navigation-drawer-item {
    background: ${themeCssVariables.background.transparent.light};
  }

  &:hover > [data-navigation-actions],
  &:focus-within > [data-navigation-actions] {
    opacity: 1;
    pointer-events: auto;
  }
`;
type NavigationMenuItemEditableProps = {
  item: NavigationMenuItem;
  children: ReactNode;
  rightOptions?: ReactNode;
};
export const NavigationMenuItemEditable = ({
  item,
  children,
  rightOptions,
}: NavigationMenuItemEditableProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const theme = useTheme();
  const isExpanded = useIsNavigationDrawerContentExpanded();
  const [
    selectedNavigationMenuItemIdInEditMode,
    setSelectedNavigationMenuItemIdInEditMode,
  ] = useAtomState(selectedNavigationMenuItemIdInEditModeState);
  const { openDropdown } = useOpenDropdown();
  const [mode, setMode] = useState<'actions' | 'edit'>('actions');
  const dropdownId = `navigation-item-${item.id}`;
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );
  const isColorPickerOpen = useAtomComponentStateValue(
    isColorPickerOpenComponentState,
    `navigation-item-${item.id}-color`,
  );
  const anchorId = `navigation-item-anchor-${item.id}`;
  const isWorkspace = !isDefined(item.userWorkspaceId);
  const canOrganize = isLayoutCustomizationModeEnabled && isWorkspace;
  const canEdit =
    item.type === NavigationMenuItemType.LINK ||
    item.type === NavigationMenuItemType.FOLDER;
  const openEditMode = useCallback(() => setMode('edit'), []);
  const open = (nextMode: 'actions' | 'edit') => {
    setMode(nextMode);
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
  };
  const shouldOpenLinkEditor =
    item.type === NavigationMenuItemType.LINK &&
    selectedNavigationMenuItemIdInEditMode === item.id;
  const canPickObjectColor =
    canOrganize && item.type === NavigationMenuItemType.OBJECT;
  const isSelectedFolder =
    item.type === NavigationMenuItemType.FOLDER &&
    selectedNavigationMenuItemIdInEditMode === item.id;
  const canEditInline = canEdit && (canOrganize || isSelectedFolder);

  const renderRow = () => {
    if (canPickObjectColor) {
      return (
        <NavigationMenuItemObjectColorEditor item={item}>
          {children}
        </NavigationMenuItemObjectColorEditor>
      );
    }

    if (canEditInline) {
      return (
        <NavigationMenuItemInlineEditor
          item={item}
          dropdownId={dropdownId}
          rowAnchorId={anchorId}
          onEditLink={() => open('edit')}
        >
          {children}
        </NavigationMenuItemInlineEditor>
      );
    }

    return children;
  };

  const row = renderRow();
  const shouldWrapInMenu =
    canOrganize ||
    (canEdit && selectedNavigationMenuItemIdInEditMode === item.id);
  const content = shouldWrapInMenu ? (
    <NavigationMenuItemMenu
      section={isWorkspace ? 'workspace' : 'favorite'}
      dropdownId={dropdownId}
      clickableComponent={row}
      disableClickForClickableComponent
      dropdownPlacement={mode === 'edit' ? 'top-start' : 'right-start'}
      dropdownOffset={
        mode === 'edit' ? { y: theme.spacingMultiplicator } : undefined
      }
      excludedClickOutsideIds={[
        `${dropdownId}-icon`,
        `${dropdownId}-icon-icon-color-picker`,
      ]}
      onClose={() =>
        setSelectedNavigationMenuItemIdInEditMode((selectedId) =>
          selectedId === item.id ? null : selectedId,
        )
      }
      renderMenu={({ onClose, onAdd }) =>
        mode === 'edit' && item.type === NavigationMenuItemType.LINK ? (
          <LegacyDropdownContent
            widthInPixels={GenericDropdownContentWidth.ExtraLarge}
          >
            <NavigationMenuItemLinkEditor
              item={item}
              dropdownId={dropdownId}
              onClose={onClose}
            />
          </LegacyDropdownContent>
        ) : (
          <NavigationMenuItemActions
            item={item}
            section={isWorkspace ? 'workspace' : 'favorite'}
            dropdownId={dropdownId}
            onClose={onClose}
            onAdd={onAdd}
          />
        )
      }
    />
  ) : (
    row
  );
  return (
    <NavigationMenuItemTypeTooltip
      type={item.type}
      hidden={
        !isLayoutCustomizationModeEnabled ||
        isDropdownOpen ||
        isColorPickerOpen ||
        selectedNavigationMenuItemIdInEditMode === item.id
      }
    >
      <StyledRow
        id={anchorId}
        onContextMenu={(event) => {
          if (
            !canOrganize ||
            !(event.target instanceof Node) ||
            !event.currentTarget.contains(event.target)
          ) {
            return;
          }
          event.preventDefault();
          event.stopPropagation();
          open('actions');
        }}
      >
        {shouldOpenLinkEditor && (
          <NavigationMenuItemLinkEditorOpenEffect
            dropdownId={dropdownId}
            onOpen={openEditMode}
          />
        )}
        {content}
        {canOrganize && isExpanded && (
          <NavigationMenuItemRowActions
            rightOptions={rightOptions}
            onOpenActions={() => open('actions')}
          />
        )}
      </StyledRow>
    </NavigationMenuItemTypeTooltip>
  );
};
