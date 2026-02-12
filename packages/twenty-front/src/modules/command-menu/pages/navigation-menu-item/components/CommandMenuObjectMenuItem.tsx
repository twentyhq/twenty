import { useTheme } from '@emotion/react';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuItemWithAddToNavigationDrag } from '@/command-menu/components/CommandMenuItemWithAddToNavigationDrag';
import { IconWithBackground } from '@/navigation-menu-item/components/IconWithBackground';
import { NavigationMenuItemType } from '@/navigation-menu-item/constants/NavigationMenuItemType';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
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
  const theme = useTheme();
  const { getIcon } = useIcons();
  const iconColors = getNavigationMenuItemIconColors(theme);
  const defaultViewId = useRecoilValue(
    coreIndexViewIdFromObjectMetadataItemFamilySelector({
      objectMetadataItemId: objectMetadataItem.id,
    }),
  );
  const Icon = getIcon(objectMetadataItem.icon);
  const isDisabled = !isDefined(defaultViewId);

  const handleClick = () => {
    if (!defaultViewId) {
      return;
    }
    onSelect(objectMetadataItem, defaultViewId);
  };

  return (
    <SelectableListItem itemId={objectMetadataItem.id} onEnter={handleClick}>
      {variant === 'add' && !isDisabled ? (
        <CommandMenuItemWithAddToNavigationDrag
          icon={Icon}
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
          Icon={({ size, stroke }) => (
            <IconWithBackground
              Icon={Icon}
              backgroundColor={iconColors.object}
              size={size}
              stroke={stroke}
            />
          )}
          label={objectMetadataItem.labelPlural}
          id={objectMetadataItem.id}
          onClick={handleClick}
          disabled={isDisabled}
        />
      )}
    </SelectableListItem>
  );
};
