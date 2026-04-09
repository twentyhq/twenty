import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';
import { getObjectColorWithFallback } from '@/object-metadata/utils/getObjectColorWithFallback';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SidePanelObjectMenuItem } from '@/navigation-menu-item/edit/side-panel/components/SidePanelObjectMenuItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SidePanelObjectPickerItemProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  isViewItem: boolean;
  onSelectObjectForViewEdit?: (
    objectMetadataItem: EnrichedObjectMetadataItem,
  ) => void;
  onChangeObject: (objectMetadataItem: EnrichedObjectMetadataItem) => void;
  objectMenuItemVariant?: 'add' | 'edit';
  dragIndex?: number;
  disableDrag?: boolean;
};

export const SidePanelObjectPickerItem = ({
  objectMetadataItem,
  isViewItem,
  onSelectObjectForViewEdit,
  onChangeObject,
  objectMenuItemVariant = 'edit',
  dragIndex,
  disableDrag = false,
}: SidePanelObjectPickerItemProps) => {
  const { getIcon } = useIcons();

  if (isViewItem && isDefined(onSelectObjectForViewEdit)) {
    return (
      <SelectableListItem
        itemId={objectMetadataItem.id}
        onEnter={() => onSelectObjectForViewEdit(objectMetadataItem)}
      >
        <CommandMenuItem
          Icon={() => (
            <NavigationMenuItemStyleIcon
              Icon={getIcon(objectMetadataItem.icon)}
              color={getObjectColorWithFallback(objectMetadataItem)}
            />
          )}
          label={objectMetadataItem.labelPlural}
          id={objectMetadataItem.id}
          onClick={() => onSelectObjectForViewEdit(objectMetadataItem)}
        />
      </SelectableListItem>
    );
  }

  return (
    <SidePanelObjectMenuItem
      objectMetadataItem={objectMetadataItem}
      onSelect={onChangeObject}
      variant={objectMenuItemVariant}
      dragIndex={dragIndex}
      disableDrag={disableDrag}
    />
  );
};
