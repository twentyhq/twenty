import { isNonEmptyString } from '@sniptt/guards';

import { useSelectedNavigationMenuItemEditItem } from '@/navigation-menu-item/hooks/useSelectedNavigationMenuItemEditItem';
import { navigationMenuItemsState } from '@/navigation-menu-item/states/navigationMenuItemsState';
import { getStandardObjectIconColor } from '@/navigation-menu-item/utils/getStandardObjectIconColor';
import { parseThemeColor } from '@/navigation-menu-item/utils/parseThemeColor';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelEditColorOption } from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditColorOption';
import {
  type OrganizeActionsProps,
  SidePanelEditOrganizeActions,
} from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditOrganizeActions';
import { getOrganizeActionsSelectableItemIds } from '@/side-panel/pages/navigation-menu-item/utils/getOrganizeActionsSelectableItemIds';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

type SidePanelEditObjectViewBaseProps = OrganizeActionsProps & {
  onOpenFolderPicker: () => void;
  objectMetadataItem?: ObjectMetadataItem | null;
};

export const SidePanelEditObjectViewBase = ({
  onOpenFolderPicker,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onRemove,
  onAddBefore,
  onAddAfter,
  objectMetadataItem,
}: SidePanelEditObjectViewBaseProps) => {
  const { t } = useLingui();
  const { selectedItem } = useSelectedNavigationMenuItemEditItem();
  const navigationMenuItems = useAtomStateValue(navigationMenuItemsState);
  const selectableItemIds = getOrganizeActionsSelectableItemIds(true);

  const persistedItem = navigationMenuItems.find(
    (item) => item.id === selectedItem?.id,
  );
  const draftColorChanged = selectedItem?.color !== persistedItem?.color;

  const objectMetadataColor = isNonEmptyString(objectMetadataItem?.color)
    ? objectMetadataItem.color
    : getStandardObjectIconColor(objectMetadataItem?.nameSingular ?? '');

  const currentColor =
    draftColorChanged && isNonEmptyString(selectedItem?.color)
      ? parseThemeColor(selectedItem.color)
      : parseThemeColor(objectMetadataColor);

  return (
    <SidePanelList commandGroups={[]} selectableItemIds={selectableItemIds}>
      {isDefined(objectMetadataItem) && isDefined(selectedItem) && (
        <SidePanelGroup heading={t`Customize`}>
          <SidePanelEditColorOption
            navigationMenuItemId={selectedItem.id}
            color={currentColor}
          />
        </SidePanelGroup>
      )}
      <SidePanelEditOrganizeActions
        canMoveUp={canMoveUp}
        canMoveDown={canMoveDown}
        onMoveUp={onMoveUp}
        onMoveDown={onMoveDown}
        onRemove={onRemove}
        onAddBefore={onAddBefore}
        onAddAfter={onAddAfter}
        showMoveToFolder
        onMoveToFolder={onOpenFolderPicker}
      />
    </SidePanelList>
  );
};
