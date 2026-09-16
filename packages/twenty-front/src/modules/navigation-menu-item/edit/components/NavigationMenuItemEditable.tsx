import { NavigationMenuItemObjectColorEditor } from '@/navigation-menu-item/edit/components/NavigationMenuItemObjectColorEditor';
import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';
import {
  isDropdownOpenComponentState,
  isDropdownOpenComponentState as isColorPickerOpenComponentState,
} from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useEffect, useState, type ReactNode } from 'react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  IconDotsVertical,
  IconAddressBook,
  IconBox,
  IconTable,
  IconLink,
  IconFolder,
  IconPerspective,
  type IconComponent,
} from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/primitives/input';
import {
  AppTooltip,
  TooltipDelay,
  TooltipPosition,
} from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { NavigationMenuItemMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemMenu';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { NavigationMenuItemActions } from '@/navigation-menu-item/edit/components/NavigationMenuItemActions';
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
const StyledActions = styled.div`
  align-items: center;
  bottom: ${themeCssVariables.spacing['0.5']};
  display: flex;
  opacity: 0;
  pointer-events: none;
  position: absolute;
  right: ${themeCssVariables.spacing['0.5']};
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
  const { t } = useLingui();
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
  const isWorkspace = !item.userWorkspaceId;
  const canOrganize = isLayoutCustomizationModeEnabled && isWorkspace;
  const canEdit =
    item.type === NavigationMenuItemType.LINK ||
    item.type === NavigationMenuItemType.FOLDER;
  const open = (nextMode: 'actions' | 'edit') => {
    setMode(nextMode);
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
  };
  useEffect(() => {
    if (
      item.type === NavigationMenuItemType.LINK &&
      selectedNavigationMenuItemIdInEditMode === item.id
    ) {
      setMode('edit');
      openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
    }
  }, [
    item.type,
    selectedNavigationMenuItemIdInEditMode,
    item.id,
    dropdownId,
    openDropdown,
  ]);
  const types: Record<
    NavigationMenuItemType,
    { label: string; Icon: IconComponent }
  > = {
    OBJECT: { label: t`Object`, Icon: IconBox },
    VIEW: { label: t`View`, Icon: IconTable },
    RECORD: { label: t`Record`, Icon: IconAddressBook },
    LINK: { label: t`Link`, Icon: IconLink },
    FOLDER: { label: t`Folder`, Icon: IconFolder },
    PAGE_LAYOUT: { label: t`Page`, Icon: IconPerspective },
  };
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
          onEditLink={() => open('edit')}
        >
          {children}
        </NavigationMenuItemInlineEditor>
      );
    }

    return children;
  };

  const row = renderRow();
  let content = row;
  if (
    canOrganize ||
    (canEdit && selectedNavigationMenuItemIdInEditMode === item.id)
  ) {
    content = (
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
            <DropdownContent
              widthInPixels={GenericDropdownContentWidth.ExtraLarge}
            >
              <NavigationMenuItemLinkEditor
                item={item}
                dropdownId={dropdownId}
                onClose={onClose}
              />
            </DropdownContent>
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
    );
  }
  return (
    <StyledRow
      id={anchorId}
      onContextMenu={(event) => {
        if (
          !canOrganize ||
          !event.currentTarget.contains(event.target as Node)
        ) {
          return;
        }
        event.preventDefault();
        event.stopPropagation();
        open('actions');
      }}
    >
      {content}
      {canOrganize && isExpanded && (
        <StyledActions
          data-navigation-actions
          onMouseDown={(event) => event.stopPropagation()}
        >
          {rightOptions}
          <LightIconButton
            Icon={IconDotsVertical}
            size="small"
            accent="tertiary"
            aria-label={t`Menu item actions`}
            onClick={(event) => {
              event.stopPropagation();
              open('actions');
            }}
          />
        </StyledActions>
      )}
      {isLayoutCustomizationModeEnabled && (
        <AppTooltip
          delay={TooltipDelay.mediumDelay}
          anchorSelect={`#${anchorId}`}
          title={types[item.type].label}
          description={
            item.type === NavigationMenuItemType.FOLDER
              ? t`Click to edit`
              : undefined
          }
          Icon={types[item.type].Icon}
          offset={theme.spacingMultiplicator}
          hidden={
            isDropdownOpen ||
            isColorPickerOpen ||
            selectedNavigationMenuItemIdInEditMode === item.id
          }
          place={TooltipPosition.Top}
          positionStrategy="fixed"
        />
      )}
    </StyledRow>
  );
};
