import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { getLinkNavigationMenuItemLabel } from '@/navigation-menu-item/display/link/utils/getLinkNavigationMenuItemLabel';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { useIcons } from 'twenty-ui/icon';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { useEffect, useState, type ReactNode } from 'react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { type ThemeColor } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';
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
  onEditLink: () => void;
};

export const NavigationMenuItemInlineEditor = ({
  item,
  children,
  dropdownId,
  onEditLink,
}: NavigationMenuItemInlineEditorProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();
  const { updateItem, isDraftMode } = useNavigationMenuItemEditController();
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
  const stopRenaming = () => {
    setIsRenaming(false);
    setNavigationMenuItemIdToRename((currentId) =>
      currentId === item.id ? null : currentId,
    );
  };
  useEffect(() => {
    if (!isNameInputVisible) return;
    pushFocusItemToFocusStack({
      focusId,
      component: { type: FocusComponentType.TEXT_INPUT, instanceId: focusId },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });
    return () => removeFocusItemFromFocusStackById({ focusId });
  }, [
    isNameInputVisible,
    focusId,
    pushFocusItemToFocusStack,
    removeFocusItemFromFocusStackById,
  ]);
  const isFolder = item.type === NavigationMenuItemType.FOLDER;
  const select = () => setSelectedNavigationMenuItemIdInEditMode(item.id);
  const finishRename = (value: string) => {
    void updateItem(item.id, { name: value.trim() || initialName });
    stopRenaming();
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
      onChange={({ iconKey }) => void updateItem(item.id, { icon: iconKey })}
      iconColorPicker={{
        selectedColor: (item.color ??
          DEFAULT_NAVIGATION_MENU_ITEM_COLOR_FOLDER) as ThemeColor,
        onColorChange: (color) => void updateItem(item.id, { color }),
      }}
      clickableComponent={iconButton}
    />
  ) : (
    iconButton
  );
  const label = isNameInputVisible ? (
    <StyledNameInput
      instanceId={focusId}
      autoFocus
      selectOnFocus
      copyButton={false}
      value={name}
      onChange={(nextName) => {
        setName(nextName);
        if (isDraftMode) void updateItem(item.id, { name: nextName });
      }}
      onEnter={finishRename}
      onTab={finishRename}
      onShiftTab={finishRename}
      onEscape={() => {
        if (isDraftMode) void updateItem(item.id, { name: initialName });
        stopRenaming();
      }}
      onClickOutside={(_, value) => finishRename(value)}
    />
  ) : (
    <StyledLabelButton
      type="button"
      onClick={(event) => {
        event.stopPropagation();
        if (isSelected) {
          setInitialName(item.name ?? '');
          setName(item.name ?? '');
          setIsRenaming(true);
        } else select();
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
          (!isFolder || !isExpanded || Boolean(item.userWorkspaceId)),
      }}
    >
      {children}
    </NavigationDrawerItemEditingContext.Provider>
  );
};
