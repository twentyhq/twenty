import { useLingui } from '@lingui/react/macro';
import { IconLink } from 'twenty-ui/display';

import { CommandMenuPageInfoLayout } from '@/command-menu/components/CommandMenuPageInfoLayout';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageInfoState';
import { commandMenuShouldFocusTitleInputComponentState } from '@/command-menu/states/commandMenuShouldFocusTitleInputComponentState';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useUpdateLinkInDraft } from '@/navigation-menu-item/hooks/useUpdateLinkInDraft';
import { useWorkspaceSectionItems } from '@/navigation-menu-item/hooks/useWorkspaceSectionItems';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const CommandMenuLinkInfo = () => {
  const { t } = useLingui();
  const commandMenuPageInfo = useAtomStateValue(commandMenuPageInfoState);
  const [
    commandMenuShouldFocusTitleInput,
    setCommandMenuShouldFocusTitleInput,
  ] = useAtomComponentState(
    commandMenuShouldFocusTitleInputComponentState,
    commandMenuPageInfo.instanceId,
  );
  const selectedNavigationMenuItemInEditMode = useAtomStateValue(
    selectedNavigationMenuItemInEditModeState,
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
          shouldFocus={commandMenuShouldFocusTitleInput}
          onFocus={() => setCommandMenuShouldFocusTitleInput(false)}
        />
      }
      label={t`Link`}
    />
  );
};
