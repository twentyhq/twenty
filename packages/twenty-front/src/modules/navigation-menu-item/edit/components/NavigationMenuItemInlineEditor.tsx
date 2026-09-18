import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { getLinkNavigationMenuItemLabel } from '@/navigation-menu-item/display/link/utils/getLinkNavigationMenuItemLabel';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { useIcons } from 'twenty-ui/icon';
import { NavigationMenuItemNameInputFocusEffect } from '@/navigation-menu-item/edit/effect-components/NavigationMenuItemNameInputFocusEffect';
import { useState, type ReactNode } from 'react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { parseThemeColor } from 'twenty-ui/utilities';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';
import { TextInput } from '@/ui/field/input/components/TextInput';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
import { DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER } from '@/navigation-menu-item/common/constants/NavigationMenuItemDefaultColorFolder';
import { FOLDER_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/FolderIconDefault';
import { NavigationDrawerItemEditingContext } from '@/ui/navigation/navigation-drawer/contexts/NavigationDrawerItemEditingContext';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useIsNavigationDrawerContentExpanded } from '@/navigation/hooks/useIsNavigationDrawerContentExpanded';

const StyledEditor = styled.div`
  display: contents;
`;

const StyledButton = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  display: flex;
  font: inherit;
  font-weight: ${themeCssVariables.font.weight.medium};
  min-width: 0;
  padding: 0;
  text-align: left;
`;
const StyledLabelButton = styled(StyledButton)`
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;
const StyledNameInput = styled(TextInput)`
  font-weight: ${themeCssVariables.font.weight.medium};
  min-width: 0;
  padding: 0;
`;

type NavigationMenuItemInlineEditorProps = {
  item: NavigationMenuItem;
  children: ReactNode;
  dropdownId: string;
  rowAnchorId: string;
  onEditLink: () => void;
};

export const NavigationMenuItemInlineEditor = ({
  item,
  children,
  dropdownId,
  rowAnchorId,
  onEditLink,
}: NavigationMenuItemInlineEditorProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { updateItem } = useNavigationMenuItemEditController(
    isDefined(item.userWorkspaceId) ? 'favorite' : 'workspace',
  );
  const [
    selectedNavigationMenuItemIdInEditMode,
    setSelectedNavigationMenuItemIdInEditMode,
  ] = useAtomState(selectedNavigationMenuItemIdInEditModeState);
  const isExpanded = useIsNavigationDrawerContentExpanded();
  const isSelected = selectedNavigationMenuItemIdInEditMode === item.id;
  const [navigationMenuItemIdToRename, setNavigationMenuItemIdToRename] =
    useAtomState(navigationMenuItemIdToRenameState);
  const [isRenaming, setIsRenaming] = useState(false);
  const [initialName, setInitialName] = useState(item.name ?? '');
  const [name, setName] = useState(item.name ?? '');
  const focusId = `${dropdownId}-name`;
  const isNameInputVisible =
    (isRenaming || navigationMenuItemIdToRename === item.id) &&
    isExpanded &&
    isSelected;
  const clearFavoriteSelection = () => {
    if (isDefined(item.userWorkspaceId)) {
      setSelectedNavigationMenuItemIdInEditMode((currentId) =>
        currentId === item.id ? null : currentId,
      );
    }
  };
  const stopRenaming = (clearSelection = true) => {
    if (clearSelection) {
      clearFavoriteSelection();
    }
    setIsRenaming(false);
    setNavigationMenuItemIdToRename((currentId) =>
      currentId === item.id ? null : currentId,
    );
  };
  const isFolder = item.type === NavigationMenuItemType.FOLDER;
  const select = () => setSelectedNavigationMenuItemIdInEditMode(item.id);
  const finishRename = (value: string, clearSelection = true) => {
    void updateItem(item.id, { name: value.trim() || initialName });
    stopRenaming(clearSelection);
  };
  const iconButton = (
    <StyledButton
      type="button"
      aria-label={isFolder ? t`Choose icon and color` : t`Edit link`}
      onClick={isFolder ? undefined : onEditLink}
    >
      {isFolder ? (
        <ColoredIcon
          Icon={getIcon(item.icon ?? FOLDER_ICON_DEFAULT)}
          color={item.color ?? DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER}
        />
      ) : (
        <NavigationMenuItemIcon navigationMenuItem={item} />
      )}
    </StyledButton>
  );
  const icon = isFolder ? (
    <IconPicker
      dropdownId={`${dropdownId}-icon`}
      selectedIconKey={item.icon ?? FOLDER_ICON_DEFAULT}
      onOpen={select}
      onClose={clearFavoriteSelection}
      onChange={({ iconKey }) => void updateItem(item.id, { icon: iconKey })}
      iconColorPicker={{
        selectedColor: parseThemeColor(
          item.color ?? DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER,
        ),
        onColorChange: (color) => void updateItem(item.id, { color }),
      }}
      clickableComponent={iconButton}
    />
  ) : (
    iconButton
  );
  const label =
    isFolder && isNameInputVisible ? (
      <StyledNameInput
        instanceId={focusId}
        autoFocus
        selectOnFocus
        copyButton={false}
        value={name}
        onChange={setName}
        onEnter={finishRename}
        onTab={finishRename}
        onShiftTab={finishRename}
        onEscape={() => stopRenaming()}
        onClickOutside={(event, value) =>
          finishRename(
            value,
            !(
              event.target instanceof Element &&
              isDefined(event.target.closest(`#${rowAnchorId}`))
            ),
          )
        }
      />
    ) : (
      <StyledLabelButton
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          if (!isFolder) {
            onEditLink();
          } else if (isSelected) {
            setInitialName(item.name ?? '');
            setName(item.name ?? '');
            setIsRenaming(true);
          } else {
            select();
          }
        }}
      >
        {isFolder ? item.name : getLinkNavigationMenuItemLabel(item)}
      </StyledLabelButton>
    );
  return (
    <NavigationDrawerItemEditingContext.Provider
      value={{
        icon,
        label,
        isSelected:
          isSelected &&
          (!isFolder || !isExpanded || isDefined(item.userWorkspaceId)),
      }}
    >
      {isNameInputVisible && (
        <NavigationMenuItemNameInputFocusEffect focusId={focusId} />
      )}
      <StyledEditor>{children}</StyledEditor>
    </NavigationDrawerItemEditingContext.Provider>
  );
};
