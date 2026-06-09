import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconLink, IconWorld } from 'twenty-ui-deprecated/display';

import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { LinkIconWithLinkOverlay } from '@/navigation-menu-item/display/link/components/LinkIconWithLinkOverlay';
import { useNavigationMenuItemEditSectionItems } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditSectionItems';
import { useNavigationMenuItemTitleEdit } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemTitleEdit';
import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';
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
  const items = useNavigationMenuItemEditSectionItems();
  const { updateItem } = useNavigationMenuItemEditController();

  const defaultLabel = t`Link label`;
  const placeholder = t`Link label`;

  const selectedItem = selectedNavigationMenuItemIdInEditMode
    ? items.find(
        (item) =>
          item.type === NavigationMenuItemType.LINK &&
          item.id === selectedNavigationMenuItemIdInEditMode,
      )
    : undefined;

  const { value, handleChange, handleSave } = useNavigationMenuItemTitleEdit({
    itemId: selectedItem?.id ?? null,
    itemName: selectedItem?.name ?? defaultLabel,
    defaultLabel,
    persistName: (name) => {
      if (isDefined(selectedItem)) {
        void updateItem(selectedItem.id, { name });
      }
    },
  });

  if (!isDefined(selectedItem)) return null;

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
          instanceId={`link-label-${selectedItem.id}`}
          sizeVariant="sm"
          value={value}
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
