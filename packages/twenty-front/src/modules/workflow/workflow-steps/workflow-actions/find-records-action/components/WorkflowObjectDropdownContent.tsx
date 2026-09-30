import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Dropdown } from 'twenty-ui/components';

type WorkflowObjectDropdownContentProps = {
  onOptionClick: (value: string) => void;
};

export const WorkflowObjectDropdownContent = ({
  onOptionClick,
}: WorkflowObjectDropdownContentProps) => {
  const { t } = useLingui();
  const [searchInputValue, setSearchInputValue] = useState('');
  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const searchInputLowerCase = searchInputValue.toLowerCase();
  const filteredObjects = objectMetadataItems.filter((objectMetadataItem) => {
    const matchesSearch = [
      objectMetadataItem.nameSingular,
      objectMetadataItem.labelSingular,
      objectMetadataItem.labelPlural,
    ].some((value) => value.toLowerCase().includes(searchInputLowerCase));

    return objectMetadataItem.isActive && matchesSearch;
  });
  const sortedObjects = [
    ...filteredObjects.filter(
      (objectMetadataItem) => !objectMetadataItem.isSystem,
    ),
    ...filteredObjects.filter(
      (objectMetadataItem) => objectMetadataItem.isSystem,
    ),
  ];

  return (
    <>
      <Dropdown.Search
        value={searchInputValue}
        onValueChange={setSearchInputValue}
        placeholder={t`Search`}
        aria-label={t`Search objects`}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        {sortedObjects.map((objectMetadataItem) => (
          <Dropdown.OptionItem
            key={objectMetadataItem.nameSingular}
            onSelect={() => onOptionClick(objectMetadataItem.nameSingular)}
            startIcon={
              <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
            }
          >
            {objectMetadataItem.labelPlural}
          </Dropdown.OptionItem>
        ))}
      </Dropdown.Section>
    </>
  );
};
