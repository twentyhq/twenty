import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { useDraftNavigationMenuItems } from '@/navigation-menu-item/edit/hooks/useDraftNavigationMenuItems';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/edit/hooks/useNavigationMenuObjectMetadataFromDraft';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SidePanelItemWithAddToNavigationDrag } from '@/side-panel/components/SidePanelItemWithAddToNavigationDrag';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { indexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/indexViewIdFromObjectMetadataItemFamilySelector';

type SidePanelObjectMenuItemProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  onSelect: (objectMetadataItem: EnrichedObjectMetadataItem) => void;
  variant: 'add' | 'edit';
  dragIndex?: number;
  disableDrag?: boolean;
};

export const SidePanelObjectMenuItem = ({
  objectMetadataItem,
  onSelect,
  variant,
  dragIndex,
  disableDrag = false,
}: SidePanelObjectMenuItemProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { currentDraft } = useDraftNavigationMenuItems();
  const { objectMetadataIdsInWorkspace } =
    useNavigationMenuObjectMetadataFromDraft(currentDraft);
  const isAlreadyInNavbar = objectMetadataIdsInWorkspace.has(
    objectMetadataItem.id,
  );
  const defaultViewId = useAtomFamilySelectorValue(
    indexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: objectMetadataItem.id },
  );
  const Icon = getIcon(objectMetadataItem.icon);
  const iconColor = getObjectColorWithFallback(objectMetadataItem);
  const isDisabled = isAlreadyInNavbar || !isDefined(defaultViewId);

  const handleClick = () => {
    if (isDisabled || !defaultViewId) {
      return;
    }
    onSelect(objectMetadataItem);
  };

  const styledIcon = () => (
    <NavigationMenuItemStyleIcon Icon={Icon} color={iconColor} />
  );

  return (
    <SelectableListItem itemId={objectMetadataItem.id} onEnter={handleClick}>
      {variant === 'add' && !isDisabled ? (
        <SidePanelItemWithAddToNavigationDrag
          icon={styledIcon}
          label={objectMetadataItem.labelPlural}
          id={objectMetadataItem.id}
          onClick={handleClick}
          dragIndex={dragIndex}
          disableDrag={disableDrag}
          payload={{
            type: NavigationMenuItemType.OBJECT,
            objectMetadataId: objectMetadataItem.id,
            label: objectMetadataItem.labelPlural,
            iconColor,
          }}
        />
      ) : (
        <CommandMenuItem
          Icon={styledIcon}
          label={objectMetadataItem.labelPlural}
          id={objectMetadataItem.id}
          onClick={handleClick}
          disabled={isDisabled}
          description={isAlreadyInNavbar ? t`Already in navbar` : undefined}
        />
      )}
    </SelectableListItem>
  );
};
