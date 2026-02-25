import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemWithAddToNavigationDrag } from '@/command-menu/components/CommandMenuItemWithAddToNavigationDrag';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { useDraftNavigationMenuItems } from '@/navigation-menu-item/hooks/useDraftNavigationMenuItems';
import { useNavigationMenuObjectMetadataFromDraft } from '@/navigation-menu-item/hooks/useNavigationMenuObjectMetadataFromDraft';
import { getStandardObjectIconColor } from '@/navigation-menu-item/utils/getStandardObjectIconColor';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { coreIndexViewIdFromObjectMetadataItemFamilySelector } from '@/views/states/selectors/coreIndexViewIdFromObjectMetadataItemFamilySelector';

type CommandMenuObjectMenuItemProps = {
  objectMetadataItem: ObjectMetadataItem;
  onSelect: (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => void;
  variant: 'add' | 'edit';
  dragIndex?: number;
};

export const CommandMenuObjectMenuItem = ({
  objectMetadataItem,
  onSelect,
  variant,
  dragIndex,
}: CommandMenuObjectMenuItemProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { currentDraft } = useDraftNavigationMenuItems();
  const { objectMetadataIdsInWorkspace } =
    useNavigationMenuObjectMetadataFromDraft(currentDraft);
  const isAlreadyInNavbar = objectMetadataIdsInWorkspace.has(
    objectMetadataItem.id,
  );
  const defaultViewId = useAtomFamilySelectorValue(
    coreIndexViewIdFromObjectMetadataItemFamilySelector,
    { objectMetadataItemId: objectMetadataItem.id },
  );
  const Icon = getIcon(objectMetadataItem.icon);
  const iconColor = getStandardObjectIconColor(objectMetadataItem.nameSingular);
  const isDisabled = isAlreadyInNavbar || !isDefined(defaultViewId);

  const handleClick = () => {
    if (isDisabled || !defaultViewId) {
      return;
    }
    onSelect(objectMetadataItem, defaultViewId);
  };

  const styledIcon = () => (
    <NavigationMenuItemStyleIcon Icon={Icon} color={iconColor} />
  );

  return (
    <SelectableListItem itemId={objectMetadataItem.id} onEnter={handleClick}>
      {variant === 'add' && !isDisabled ? (
        <CommandMenuItemWithAddToNavigationDrag
          icon={styledIcon}
          label={objectMetadataItem.labelPlural}
          id={objectMetadataItem.id}
          onClick={handleClick}
          dragIndex={dragIndex}
          payload={{
            type: NavigationMenuItemType.OBJECT,
            objectMetadataId: objectMetadataItem.id,
            defaultViewId: defaultViewId ?? '',
            label: objectMetadataItem.labelPlural,
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
