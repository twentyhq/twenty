import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { getNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getNavigationMenuItemColor';
import { getNavigationMenuItemObjectNameSingular } from '@/navigation-menu-item/display/object/utils/getNavigationMenuItemObjectNameSingular';
import { SidePanelEditColorOption } from '@/navigation-menu-item/edit/side-panel/components/SidePanelEditColorOption';
import {
  type OrganizeActionsProps,
  SidePanelEditOrganizeActions,
} from '@/navigation-menu-item/edit/side-panel/components/SidePanelEditOrganizeActions';
import { getOrganizeActionsSelectableItemIds } from '@/navigation-menu-item/edit/side-panel/utils/getOrganizeActionsSelectableItemIds';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { SidePanelList } from '@/side-panel/components/SidePanelList';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { parseThemeColor } from 'twenty-ui/utilities';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

type SidePanelEditObjectViewBaseProps = OrganizeActionsProps & {
  onOpenFolderPicker: () => void;
  showMoveToFolder?: boolean;
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
  showMoveToFolder = false,
  showColorOption = false,
  selectedItem,
}: SidePanelEditObjectViewBaseProps) => {
  const { t } = useLingui();
  const selectableItemIds =
    getOrganizeActionsSelectableItemIds(showMoveToFolder);
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);
  const views = useAtomStateValue(viewsSelector);

  const objectNameSingular = isDefined(selectedItem)
    ? (getNavigationMenuItemObjectNameSingular(
        selectedItem,
        objectMetadataItems,
        views,
      ) ?? '')
    : '';

  const objectMetadataItem = objectMetadataItems.find(
    (item) => item.nameSingular === objectNameSingular,
  );

  const navigationMenuItems = useAtomStateValue(navigationMenuItemsSelector);
  const persistedNavItem = navigationMenuItems.find(
    (item) => item.id === selectedItem?.id,
  );
  const hasUserChangedColor =
    isNonEmptyString(selectedItem?.color) &&
    selectedItem.color !== (persistedNavItem?.color ?? undefined);

  const effectiveColor = isDefined(selectedItem)
    ? getNavigationMenuItemColor(selectedItem, objectMetadataItem)
    : undefined;
  const displayColor = hasUserChangedColor
    ? selectedItem.color
    : effectiveColor;

  return (
    <SidePanelList selectableItemIds={selectableItemIds}>
      {showColorOption &&
        isDefined(selectedItem) &&
        objectMetadataItem?.isSystem !== true && (
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
        showMoveToFolder={showMoveToFolder}
        onMoveToFolder={onOpenFolderPicker}
      />
    </SidePanelList>
  );
};
