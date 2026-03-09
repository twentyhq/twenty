import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/components/NavigationMenuItemStyleIcon';
import { getStandardObjectIconColor } from '@/navigation-menu-item/utils/getStandardObjectIconColor';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SidePanelObjectMenuItem } from '@/side-panel/pages/navigation-menu-item/components/SidePanelObjectMenuItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SidePanelObjectPickerItemProps = {
  objectMetadataItem: ObjectMetadataItem;
  isViewItem: boolean;
  onSelectObjectForViewEdit?: (objectMetadataItem: ObjectMetadataItem) => void;
  onChangeObject: (
    objectMetadataItem: ObjectMetadataItem,
    defaultViewId: string,
  ) => void;
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
              color={getStandardObjectIconColor(
                objectMetadataItem.nameSingular,
              )}
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
