import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type SpreadsheetImportFieldOption } from '@/spreadsheet-import/types/SpreadsheetImportFieldOption';
import { getSubFieldOptions } from '@/spreadsheet-import/utils/spreadsheetImportGetSubFieldOptions';
import { hasNestedFields } from '@/spreadsheet-import/utils/spreadsheetImportHasNestedFields';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useState } from 'react';
import { IconChevronLeft, OverflowingTextWithTooltip } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';

export const MatchColumnSelectSubFieldSelectDropdownContent = ({
  fieldMetadataItem,
  onSubFieldSelect,
  options,
  onBack,
}: {
  fieldMetadataItem: FieldMetadataItem;
  onSubFieldSelect: (subFieldNameSelected: string) => void;
  options: readonly Readonly<SpreadsheetImportFieldOption>[];
  onBack: () => void;
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;

    setSearchFilter(value);
  };

  const handleSubFieldSelect = (subFieldName: string) => {
    onSubFieldSelect(subFieldName);
  };

  const handleSubMenuBack = () => {
    setSearchFilter('');
    onBack();
  };

  if (!hasNestedFields(fieldMetadataItem)) {
    return <></>;
  }

  const subFieldOptions = getSubFieldOptions(
    fieldMetadataItem,
    options,
    searchFilter,
  );

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={handleSubMenuBack}
            Icon={IconChevronLeft}
          />
        }
      >
        <OverflowingTextWithTooltip text={fieldMetadataItem.label} />
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={handleFilterChange}
        autoFocus
      />
      <DropdownMenuSeparator />
      <DropdownMenuItemsContainer hasMaxHeight>
        {subFieldOptions.map(
          ({ value, shortLabelForNestedField, Icon, disabled }) => (
            <MenuItem
              key={value}
              onClick={() => handleSubFieldSelect(value)}
              LeftIcon={Icon}
              text={shortLabelForNestedField}
              disabled={disabled}
            />
          ),
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );
};
