import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { IconSettings, useIcons } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { useFilteredPickerItems } from '@/command-menu/hooks/useFilteredPickerItems';
import { IconWithBackground } from '@/navigation-menu-item/components/IconWithBackground';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CommandMenuNewSidebarItemViewObjectPickerSubViewProps = {
  objects: ObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onOpenSystemPicker: () => void;
  onSelectObject: (objectMetadataItem: ObjectMetadataItem) => void;
  showSystemObjectsOption?: boolean;
};

export const CommandMenuNewSidebarItemViewObjectPickerSubView = ({
  objects,
  searchValue,
  onSearchChange,
  onBack,
  onOpenSystemPicker,
  onSelectObject,
  showSystemObjectsOption = true,
}: CommandMenuNewSidebarItemViewObjectPickerSubViewProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const iconColors = getNavigationMenuItemIconColors(theme);
  const { filteredItems, selectableItemIds, isEmpty, hasSearchQuery } =
    useFilteredPickerItems({
      items: objects,
      searchQuery: searchValue,
      getSearchableValues: (item) => [item.labelPlural],
      appendSelectableIds: showSystemObjectsOption ? ['system'] : [],
    });
  const noResultsText = hasSearchQuery
    ? t`No results found`
    : t`No objects with views found`;

  return (
    <CommandMenuSubViewWithSearch
      backBarTitle={t`Pick an object`}
      onBack={onBack}
      searchPlaceholder={t`Search an object...`}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
    >
      <CommandMenuList
        commandGroups={[]}
        selectableItemIds={selectableItemIds}
        noResults={isEmpty}
        noResultsText={noResultsText}
      >
        <CommandGroup heading={t`Objects`}>
          {filteredItems.map((objectMetadataItem) => (
            <SelectableListItem
              key={objectMetadataItem.id}
              itemId={objectMetadataItem.id}
              onEnter={() => onSelectObject(objectMetadataItem)}
            >
              <CommandMenuItem
                Icon={({ size, stroke }) => (
                  <IconWithBackground
                    Icon={getIcon(objectMetadataItem.icon)}
                    backgroundColor={iconColors.object}
                    size={size}
                    stroke={stroke}
                  />
                )}
                label={objectMetadataItem.labelPlural}
                id={objectMetadataItem.id}
                hasSubMenu
                onClick={() => onSelectObject(objectMetadataItem)}
              />
            </SelectableListItem>
          ))}
          {showSystemObjectsOption && (
            <SelectableListItem itemId="system" onEnter={onOpenSystemPicker}>
              <CommandMenuItem
                Icon={IconSettings}
                label={t`System objects`}
                id="system"
                hasSubMenu={true}
                onClick={onOpenSystemPicker}
              />
            </SelectableListItem>
          )}
        </CommandGroup>
      </CommandMenuList>
    </CommandMenuSubViewWithSearch>
  );
};
