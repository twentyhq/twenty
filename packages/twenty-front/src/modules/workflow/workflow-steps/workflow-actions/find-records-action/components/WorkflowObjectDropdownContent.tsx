import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { Trans } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { IconChevronLeft, IconSettings, useIcons } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

type WorkflowObjectDropdownContentProps = {
  onOptionClick: (value: string) => void;
  showAdvancedOption?: boolean;
};

export const WorkflowObjectDropdownContent = ({
  onOptionClick,
  showAdvancedOption = true,
}: WorkflowObjectDropdownContentProps) => {
  const { getIcon } = useIcons();
  const [searchInputValue, setSearchInputValue] = useState('');
  const [isSystemObjectsOpen, setIsSystemObjectsOpen] = useState(false);

  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const nonSystemObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) =>
      objectMetadataItem.isActive && !objectMetadataItem.isSystem,
  );
  const systemObjectMetadataItems = objectMetadataItems.filter(
    (objectMetadataItem) =>
      objectMetadataItem.isActive && objectMetadataItem.isSystem,
  );

  const matchesSearchFilter = (
    objectMetadataItem: (typeof objectMetadataItems)[number],
    searchInputLowerCase: string,
  ) => {
    return (
      objectMetadataItem.nameSingular
        .toLowerCase()
        .includes(searchInputLowerCase) ||
      objectMetadataItem.labelSingular
        .toLowerCase()
        .includes(searchInputLowerCase) ||
      objectMetadataItem.labelPlural
        .toLowerCase()
        .includes(searchInputLowerCase)
    );
  };

  const searchInputLowerCase = searchInputValue.toLowerCase();

  const shouldShowAdvanced =
    showAdvancedOption &&
    !isSystemObjectsOpen &&
    (!isNonEmptyString(searchInputValue) ||
      searchInputLowerCase.includes('advanced'));

  const filteredNonSystemObjects = nonSystemObjectMetadataItems.filter(
    (objectMetadataItem) =>
      matchesSearchFilter(objectMetadataItem, searchInputLowerCase),
  );

  const filteredSystemObjects = systemObjectMetadataItems.filter(
    (objectMetadataItem) =>
      matchesSearchFilter(objectMetadataItem, searchInputLowerCase),
  );

  const filteredObjects = isSystemObjectsOpen
    ? filteredSystemObjects
    : filteredNonSystemObjects;

  const filteredOptions = filteredObjects.map((objectMetadataItem) => ({
    Icon: getIcon(objectMetadataItem.icon),
    label: objectMetadataItem.labelPlural,
    value: objectMetadataItem.nameSingular,
  }));

  const handleSystemObjectsClick = () => {
    setIsSystemObjectsOpen(true);
    setSearchInputValue('');
  };

  const handleBack = () => {
    setIsSystemObjectsOpen(false);
    setSearchInputValue('');
  };

  const handleSearchInputChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setSearchInputValue(event.target.value);
  };

  const handleAdvancedClick = () => {
    if (!isSystemObjectsOpen) {
      handleSystemObjectsClick();
    }
  };

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      {isSystemObjectsOpen && (
        <DropdownMenuHeader
          StartComponent={
            <DropdownMenuHeaderLeftComponent
              onClick={handleBack}
              Icon={IconChevronLeft}
            />
          }
        >
          <Trans>Advanced</Trans>
        </DropdownMenuHeader>
      )}
      <DropdownMenuSearchInput
        autoFocus
        value={searchInputValue}
        onChange={handleSearchInputChange}
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {filteredOptions.map((option) => (
          <MenuItem
            key={option.value}
            LeftIcon={option.Icon}
            text={option.label}
            onClick={() => onOptionClick(option.value)}
          />
        ))}
        {shouldShowAdvanced && (
          <MenuItem
            text={<Trans>Advanced</Trans>}
            LeftIcon={IconSettings}
            onClick={handleAdvancedClick}
            hasSubMenu
          />
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
