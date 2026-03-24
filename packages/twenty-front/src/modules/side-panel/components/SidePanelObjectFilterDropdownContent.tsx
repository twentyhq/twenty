import { useLingui } from '@lingui/react/macro';
import { useMemo, useState } from 'react';
import { IconCube, useIcons } from 'twenty-ui/display';
import { MenuItemSelectAvatar } from 'twenty-ui/navigation';

import { getStandardObjectIconColor } from '@/navigation-menu-item/common/utils/getStandardObjectIconColor';
import { NavigationMenuItemStyleIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemStyleIcon';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { filterReadableActiveObjectMetadataItems } from '@/object-metadata/utils/filterReadableActiveObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

import { OBJECT_FILTER_DROPDOWN_ID } from '@/side-panel/components/SidePanelObjectFilterDropdown';

type SidePanelObjectFilterDropdownContentProps = {
  selectedObjectNameSingular: string | null;
  onSelectObject: (objectNameSingular: string | null) => void;
};

export const SidePanelObjectFilterDropdownContent = ({
  selectedObjectNameSingular,
  onSelectObject,
}: SidePanelObjectFilterDropdownContentProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const [filterSearch, setFilterSearch] = useState('');
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const { closeDropdown } = useCloseDropdown();

  const searchableObjectItems = useMemo(
    () =>
      filterReadableActiveObjectMetadataItems(
        activeObjectMetadataItems,
        objectPermissionsByObjectMetadataId,
      ).filter(
        (item) =>
          item.isSearchable &&
          item.labelPlural.toLowerCase().includes(filterSearch.toLowerCase()),
      ),
    [
      activeObjectMetadataItems,
      objectPermissionsByObjectMetadataId,
      filterSearch,
    ],
  );

  const handleSelect = (objectNameSingular: string | null) => {
    onSelectObject(objectNameSingular);
    closeDropdown(OBJECT_FILTER_DROPDOWN_ID);
  };

  return (
    <DropdownContent>
      <DropdownMenuHeader>{t`Object`}</DropdownMenuHeader>
      <DropdownMenuSearchInput
        value={filterSearch}
        onChange={(event) => setFilterSearch(event.target.value)}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        <MenuItemSelectAvatar
          avatar={<NavigationMenuItemStyleIcon Icon={IconCube} color="gray" />}
          text={t`All Objects`}
          selected={selectedObjectNameSingular === null}
          onClick={() => handleSelect(null)}
        />
        {searchableObjectItems.map((objectMetadataItem) => {
          const ObjectIcon = getIcon(objectMetadataItem.icon);
          const iconColor = getStandardObjectIconColor(
            objectMetadataItem.nameSingular,
          );

          return (
            <MenuItemSelectAvatar
              key={objectMetadataItem.id}
              avatar={
                <NavigationMenuItemStyleIcon
                  Icon={ObjectIcon}
                  color={iconColor}
                />
              }
              text={objectMetadataItem.labelPlural}
              selected={
                selectedObjectNameSingular === objectMetadataItem.nameSingular
              }
              onClick={() => handleSelect(objectMetadataItem.nameSingular)}
            />
          );
        })}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
