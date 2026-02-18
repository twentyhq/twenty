import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useIcons } from 'twenty-ui/display';

import { CommandGroup } from '@/command-menu/components/CommandGroup';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CommandMenuList } from '@/command-menu/components/CommandMenuList';
import { CommandMenuSubViewWithSearch } from '@/command-menu/components/CommandMenuSubViewWithSearch';
import { IconWithBackground } from '@/navigation-menu-item/components/IconWithBackground';
import { getNavigationMenuItemIconColors } from '@/navigation-menu-item/utils/getNavigationMenuItemIconColors';
import { useFilteredPickerItems } from '@/command-menu/hooks/useFilteredPickerItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CommandMenuNewSidebarItemViewSystemSubViewProps = {
  systemObjects: ObjectMetadataItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  onBack: () => void;
  onSelectObject: (objectMetadataItem: ObjectMetadataItem) => void;
};

export const CommandMenuNewSidebarItemViewSystemSubView = ({
  systemObjects,
  searchValue,
  onSearchChange,
  onBack,
  onSelectObject,
}: CommandMenuNewSidebarItemViewSystemSubViewProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const iconColors = getNavigationMenuItemIconColors(theme);
  const {
    filteredItems: filteredSystemObjectMetadataItems,
    selectableItemIds,
    isEmpty,
    hasSearchQuery,
  } = useFilteredPickerItems({
    items: systemObjects,
    searchQuery: searchValue,
    getSearchableValues: (item) => [item.labelPlural],
  });
  const noResultsText = hasSearchQuery
    ? t`No results found`
    : t`No system objects with views found`;

  return (
    <CommandMenuSubViewWithSearch
      backBarTitle={t`System objects`}
      onBack={onBack}
      searchPlaceholder={t`Search a system object...`}
      searchValue={searchValue}
      onSearchChange={onSearchChange}
    >
      <CommandMenuList
        commandGroups={[]}
        selectableItemIds={selectableItemIds}
        noResults={isEmpty}
        noResultsText={noResultsText}
      >
        <CommandGroup heading={t`System objects`}>
          {filteredSystemObjectMetadataItems.map((objectMetadataItem) => (
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
                onClick={() => onSelectObject(objectMetadataItem)}
              />
            </SelectableListItem>
          ))}
        </CommandGroup>
      </CommandMenuList>
    </CommandMenuSubViewWithSearch>
  );
};
