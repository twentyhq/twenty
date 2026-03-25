import { useLingui } from '@lingui/react/macro';
import { IconLink, IconWorld } from 'twenty-ui/display';

import { LinkIconWithLinkOverlay } from '@/navigation-menu-item/display/link/components/LinkIconWithLinkOverlay';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { useUpdateLinkInDraft } from '@/navigation-menu-item/edit/link/hooks/useUpdateLinkInDraft';
import { useNavigationMenuItemSectionItems } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemSectionItems';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { SidePanelPageInfoLayout } from '@/side-panel/components/SidePanelPageInfoLayout';
import { sidePanelPageInfoState } from '@/side-panel/states/sidePanelPageInfoState';
import { sidePanelShouldFocusTitleInputComponentState } from '@/side-panel/states/sidePanelShouldFocusTitleInputComponentState';
import { TitleInput } from '@/ui/input/components/TitleInput';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SidePanelLinkInfo = () => {
  const { t } = useLingui();
  const sidePanelPageInfo = useAtomStateValue(sidePanelPageInfoState);
  const [sidePanelShouldFocusTitleInput, setSidePanelShouldFocusTitleInput] =
    useAtomComponentState(
      sidePanelShouldFocusTitleInputComponentState,
      sidePanelPageInfo.instanceId,
    );
  const selectedNavigationMenuItemIdInEditMode = useAtomStateValue(
    selectedNavigationMenuItemIdInEditModeState,
  );
  const items = useNavigationMenuItemSectionItems();
  const { updateLinkInDraft } = useUpdateLinkInDraft();

  const defaultLabel = t`Link label`;
  const placeholder = t`Link label`;

  const selectedItem = selectedNavigationMenuItemIdInEditMode
    ? items.find(
        (item) =>
          item.type === NavigationMenuItemType.LINK &&
          item.id === selectedNavigationMenuItemIdInEditMode,
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
    <SidePanelPageInfoLayout
      icon={
        <LinkIconWithLinkOverlay
          link={selectedItem.link}
          LinkIcon={IconLink}
          DefaultIcon={IconWorld}
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
          shouldFocus={sidePanelShouldFocusTitleInput}
          onFocus={() => setSidePanelShouldFocusTitleInput(false)}
        />
      }
      label={t`Link`}
    />
  );
};
