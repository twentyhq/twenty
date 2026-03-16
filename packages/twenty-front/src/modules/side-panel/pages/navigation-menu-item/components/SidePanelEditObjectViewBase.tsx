import { useObjectNavItemColor } from '@/navigation-menu-item/hooks/useObjectNavItemColor';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/states/navigationMenuItemsSelector';
import { getEffectiveNavigationMenuItemColor } from '@/navigation-menu-item/utils/getEffectiveNavigationMenuItemColor';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/utils/getNavigationMenuItemObjectNameSingular';
import { parseThemeColor } from '@/navigation-menu-item/utils/parseThemeColor';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { SidePanelEditColorOption } from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditColorOption';
import {
  type OrganizeActionsProps,
  SidePanelEditOrganizeActions,
} from '@/side-panel/pages/navigation-menu-item/components/SidePanelEditOrganizeActions';
import { getOrganizeActionsSelectableItemIds } from '@/side-panel/pages/navigation-menu-item/utils/getOrganizeActionsSelectableItemIds';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type SidePanelEditObjectViewBaseProps = OrganizeActionsProps & {
  onOpenFolderPicker: () => void;
  showColorOption?: boolean;
  selectedItem?: NavigationMenuItem | null;
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
  showColorOption = false,
  selectedItem,
}: SidePanelEditObjectViewBaseProps) => {
  const { t } = useLingui();
  const selectableItemIds = getOrganizeActionsSelectableItemIds(true);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);

  const objectNameSingular = isDefined(selectedItem)
    ? (getNavigationMenuItemObjectNameSingular(
        selectedItem,
        objectMetadataItems,
        views,
      ) ?? '')
    : '';

  const objectColor = useObjectNavItemColor(objectNameSingular);

  const navigationMenuItems = useAtomStateValue(navigationMenuItemsSelector);
  const persistedNavItem = navigationMenuItems.find(
    (item) => item.id === selectedItem?.id,
  );
  const hasUserChangedColor =
    isNonEmptyString(selectedItem?.color) &&
    selectedItem.color !== (persistedNavItem?.color ?? undefined);

  const effectiveColor = isDefined(selectedItem)
    ? getEffectiveNavigationMenuItemColor(selectedItem, objectColor)
    : undefined;
  const displayColor = hasUserChangedColor
    ? selectedItem.color
    : effectiveColor;

  return (
    <SidePanelList commandGroups={[]} selectableItemIds={selectableItemIds}>
      {showColorOption && isDefined(selectedItem) && (
        <SidePanelGroup heading={t`Customize`}>
          <SidePanelEditColorOption
            navigationMenuItemId={selectedItem.id}
            color={parseThemeColor(displayColor)}
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
