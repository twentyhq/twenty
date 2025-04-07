import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { DropdownMenu } from '@/ui/layout/dropdown/components/DropdownMenu';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { t } from '@lingui/core/macro';
import { ChangeEvent, useState } from 'react';
import { useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type SettingsRolePermissionsObjectLevelObjectPickerDropdownProps = {
  excludedObjectMetadataIds: string[];
  onSelect: (objectMetadataId: string) => void;
};

export const SettingsRolePermissionsObjectLevelObjectPickerDropdown = ({
  excludedObjectMetadataIds,
  onSelect,
}: SettingsRolePermissionsObjectLevelObjectPickerDropdownProps) => {
  const [searchFilter, setSearchFilter] = useState('');

  const { objectMetadataItems } = useFilteredObjectMetadataItems();

  const { getIcon } = useIcons();

  const handleSearchFilterChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchFilter(event.target.value);
  };

  const filteredObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) =>
      objectMetadataItem.labelSingular
        .toLowerCase()
        .includes(searchFilter.toLowerCase()),
  );

  return (
    <DropdownMenu>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={handleSearchFilterChange}
        placeholder={t`Search`}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {filteredObjectMetadataItems.map((objectMetadataItem) => (
          <MenuItem
            key={objectMetadataItem.id}
            text={objectMetadataItem.labelSingular}
            LeftIcon={getIcon(objectMetadataItem.icon)}
            onClick={() => onSelect(objectMetadataItem.id)}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownMenu>
  );
};
