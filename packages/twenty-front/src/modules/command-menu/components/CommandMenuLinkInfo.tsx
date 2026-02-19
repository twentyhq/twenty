import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { IconLink } from 'twenty-ui/display';

import { CommandMenuPageInfoLayout } from '@/command-menu/components/CommandMenuPageInfoLayout';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuShouldFocusTitleInputComponentState } from '@/command-menu/states/commandMenuShouldFocusTitleInputComponentState';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useUpdateLinkInDraft } from '@/navigation-menu-item/hooks/useUpdateLinkInDraft';
import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeStateV2 } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeStateV2';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

export const CommandMenuLinkInfo = () => {
  const { t } = useLingui();
  const commandMenuPageInfo = useRecoilValue(commandMenuPageInfoState);
  const [shouldFocusTitleInput, setShouldFocusTitleInput] =
    useRecoilComponentState(
      commandMenuShouldFocusTitleInputComponentState,
      commandMenuPageInfo.instanceId,
    );
  const selectedNavigationMenuItemInEditMode = useRecoilValueV2(
    selectedNavigationMenuItemInEditModeStateV2,
  );
  const items = useWorkspaceSectionItems();
  const { updateLinkInDraft } = useUpdateLinkInDraft();

  const defaultLabel = t`Link label`;
  const placeholder = t`Link label`;

  const selectedItem = selectedNavigationMenuItemInEditMode
    ? items.find(
        (item) =>
          item.itemType === NavigationMenuItemType.LINK &&
          item.id === selectedNavigationMenuItemInEditMode,
      )
    : undefined;

  if (!selectedItem) return null;

  const itemId = selectedItem.id;
  const itemName = selectedItem.name ?? defaultLabel;

  const handleChange = (text: string) => {
    updateLinkInDraft(itemId, { name: text });
  };

  const handleSave = () => {
    const trimmed = itemName.trim();
    const finalName = trimmed.length > 0 ? trimmed : defaultLabel;

    if (finalName !== itemName) {
      updateLinkInDraft(itemId, { name: finalName });
    }
  };

  return (
    <CommandMenuPageInfoLayout
      icon={
        <NavigationMenuItemStyleIcon
          Icon={IconLink}
          color={selectedItem.color}
        />
      }
      title={
        <TitleInput
          instanceId={`link-label-${itemId}`}
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
      label={t`Link`}
    />
  );
};
