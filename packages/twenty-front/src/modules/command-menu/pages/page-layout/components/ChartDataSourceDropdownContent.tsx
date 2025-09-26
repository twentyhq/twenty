import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/navigation';

export const ChartDataSourceDropdownContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const availableObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) => {
      const objectPermissions =
        objectPermissionsByObjectMetadataId[objectMetadataItem.id];

      const hasReadAccess =
        isDefined(objectPermissions) && objectPermissions.canReadObjectRecords;

      const matchesSearch =
        !isNonEmptyString(searchQuery) ||
        objectMetadataItem.labelPlural
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        objectMetadataItem.namePlural
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

      return hasReadAccess && matchesSearch;
    },
  );

  return (
    <>
      <DropdownMenuHeader>Source</DropdownMenuHeader>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        placeholder="Search objects"
        onChange={(event) => setSearchQuery(event.target.value)}
        value={searchQuery}
      />
      <DropdownMenuItemsContainer>
        {availableObjectMetadataItems.map((objectMetadataItem) => (
          <MenuItem
            key={objectMetadataItem.id}
            text={objectMetadataItem.labelPlural}
            onClick={() => {
              // TODO: Handle object selection
            }}
          />
        ))}
      </DropdownMenuItemsContainer>
    </>
  );
};
