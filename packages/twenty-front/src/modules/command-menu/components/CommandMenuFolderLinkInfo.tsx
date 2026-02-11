import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { IconFolder, IconLink } from 'twenty-ui/display';

import { CommandMenuPageInfoLayout } from '@/command-menu/components/CommandMenuPageInfoLayout';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuShouldFocusTitleInputComponentState } from '@/command-menu/states/commandMenuShouldFocusTitleInputComponentState';
import { StyledNavigationMenuItemIconContainer } from '@/navigation-menu-item/components/NavigationMenuItemIconContainer';
import { useUpdateFolderNameInDraft } from '@/navigation-menu-item/hooks/useUpdateFolderNameInDraft';
import { useUpdateLinkInDraft } from '@/navigation-menu-item/hooks/useUpdateLinkInDraft';
import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';

const ICON_CONFIG = {
  folder: { Icon: IconFolder, colorKey: 'folder' },
  link: { Icon: IconLink, colorKey: 'link' },
} as const;

export const CommandMenuFolderLinkInfo = ({
  type,
}: {
  type: 'folder' | 'link';
}) => {
  const theme = useTheme();
  const { t } = useLingui();
  const commandMenuPageInfo = useRecoilValue(commandMenuPageInfoState);
  const [shouldFocusTitleInput, setShouldFocusTitleInput] =
    useRecoilComponentState(
      commandMenuShouldFocusTitleInputComponentState,
      commandMenuPageInfo.instanceId,
    );
  const selectedNavigationMenuItemInEditMode = useRecoilValue(
    selectedNavigationMenuItemInEditModeState,
  );
  const items = useWorkspaceSectionItems();
  const { updateFolderNameInDraft } = useUpdateFolderNameInDraft();
  const { updateLinkInDraft } = useUpdateLinkInDraft();

  const defaultLabel = type === 'folder' ? t`New folder` : t`Link label`;
  const placeholder = type === 'folder' ? t`Folder name` : t`Link label`;

  const selectedItem = selectedNavigationMenuItemInEditMode
    ? items.find(
        (item) =>
          item.itemType === type &&
          item.id === selectedNavigationMenuItemInEditMode,
      )
    : undefined;

  if (!selectedItem) return null;

  const itemId = selectedItem.id;
  const itemName = selectedItem.name ?? defaultLabel;

  const handleChange = (text: string) => {
    if (type === 'folder') {
      updateFolderNameInDraft(itemId, text);
    } else {
      updateLinkInDraft(itemId, { name: text });
    }
  };

  const handleSave = () => {
    const trimmed = itemName.trim();
    const finalName = trimmed.length > 0 ? trimmed : defaultLabel;

    if (finalName !== itemName) {
      if (type === 'folder') {
        updateFolderNameInDraft(itemId, finalName);
      } else {
        updateLinkInDraft(itemId, { name: finalName });
      }
    }
  };

  const { Icon, colorKey } = ICON_CONFIG[type];

  return (
    <CommandMenuPageInfoLayout
      icon={
        <StyledNavigationMenuItemIconContainer
          $backgroundColor={getNavigationMenuItemIconColors(theme)[colorKey]}
        >
          <Icon
            size={theme.spacing(3.5)}
            color={theme.grayScale.gray1}
            stroke={theme.icon.stroke.md}
          />
        </StyledNavigationMenuItemIconContainer>
      }
      title={
        <TitleInput
          instanceId={
            type === 'folder' ? `folder-name-${itemId}` : `link-label-${itemId}`
          }
          sizeVariant="sm"
          value={itemName}
          onChange={handleChange}
          placeholder={placeholder}
          onEnter={handleSave}
          onEscape={handleSave}
          onClickOutside={handleSave}
          onTab={handleSave}
          onShiftTab={handleSave}
          shouldFocus={shouldFocusTitleInput}
          onFocus={() => setShouldFocusTitleInput(false)}
        />
      }
      label={type === 'link' ? t`link` : undefined}
    />
  );
};
