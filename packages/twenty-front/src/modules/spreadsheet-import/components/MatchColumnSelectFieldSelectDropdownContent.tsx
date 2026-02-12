import { useMemo, useState } from 'react';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldMetadataTypeLabel } from '@/object-record/object-filter-dropdown/utils/getFieldMetadataTypeLabel';
import { DO_NOT_IMPORT_OPTION_KEY } from '@/spreadsheet-import/constants/DoNotImportOptionKey';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { hasNestedFields } from '@/spreadsheet-import/utils/spreadsheetImportHasNestedFields';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { DropdownMenuSectionLabel } from '@/ui/layout/dropdown/components/DropdownMenuSectionLabel';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { ScrollWrapper } from '@/ui/utilities/scroll/components/ScrollWrapper';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { IconForbid, IconX, useIcons } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { MenuItemSelect } from 'twenty-ui/navigation';
import { type ReadonlyDeep } from 'type-fest';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const StyledContainer = styled.div`
  max-height: 360px;
`;

export const MatchColumnSelectFieldSelectDropdownContent = ({
  selectedValue,
  onSelectFieldMetadataItem,
  onSelectSuggestedOption,
  onCancelSelect,
  onDoNotImportSelect,
  suggestedOptions,
}: {
  selectedValue: SelectOption | undefined;
  onSelectFieldMetadataItem: (
    selectedFieldMetadataItem: FieldMetadataItem,
  ) => void;
  onSelectSuggestedOption: (selectedSuggestedOption: SelectOption) => void;
  onCancelSelect: () => void;
  onDoNotImportSelect: () => void;
  suggestedOptions: readonly ReadonlyDeep<
    SelectOption & { fieldMetadataTypeLabel?: string }
  >[];
}) => {
  const [searchFilter, setSearchFilter] = useState('');

  const handleFilterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.currentTarget.value;

    setSearchFilter(value);
  };

  const { availableFieldMetadataItems } = useSpreadsheetImportInternal();

  const filteredAvailableFieldMetadataItems = useMemo(() => {
    const searchTerm = normalizeSearchText(searchFilter);
    return availableFieldMetadataItems.filter((field) => {
      return (
        normalizeSearchText(field.label).includes(searchTerm) ||
        normalizeSearchText(field.name).includes(searchTerm)
      );
    });
  }, [availableFieldMetadataItems, searchFilter]);

  const { getIcon } = useIcons();

  const handleFieldClick = (fieldMetadataItem: FieldMetadataItem) => {
    onSelectFieldMetadataItem(fieldMetadataItem);
  };

  const handleSuggestedOptionClick = (suggestedOption: SelectOption) => {
    onSelectSuggestedOption(suggestedOption);
  };

  const handleCancelClick = () => {
    onCancelSelect();
  };

  const { t } = useLingui();

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={handleCancelClick}
            Icon={IconX}
          />
        }
      >
        {t`Select matching field`}
      </DropdownMenuHeader>
      <DropdownMenuSearchInput
        value={searchFilter}
        onChange={handleFilterChange}
        autoFocus
        placeholder={t`Search fields`}
      />
      <DropdownMenuSeparator />
      <StyledContainer>
        <ScrollWrapper componentInstanceId="match-column-select-field-select-dropdown-content">
          {!isNonEmptyString(searchFilter) && (
            <>
              <DropdownMenuItemsContainer scrollable={false}>
                <MenuItemSelect
                  selected={selectedValue?.value === DO_NOT_IMPORT_OPTION_KEY}
                  onClick={onDoNotImportSelect}
                  LeftIcon={IconForbid}
                  text={t`Do not import`}
                />
              </DropdownMenuItemsContainer>
              {suggestedOptions.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuSectionLabel label={t`Suggested`} />
                  <DropdownMenuItemsContainer scrollable={false}>
                    {suggestedOptions.map((option) => (
                      <MenuItemSelect
                        key={option.value}
                        selected={selectedValue?.value === option.value}
                        onClick={() => handleSuggestedOptionClick(option)}
                        LeftIcon={option.Icon}
                        text={option.label}
                        contextualText={option.fieldMetadataTypeLabel}
                      />
                    ))}
                  </DropdownMenuItemsContainer>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuSectionLabel label={t`All fields`} />
            </>
          )}
          <DropdownMenuItemsContainer scrollable={false}>
            {filteredAvailableFieldMetadataItems.map((field) => (
              <MenuItemSelect
                key={field.id}
                selected={selectedValue?.value === field.name}
                onClick={() => handleFieldClick(field)}
                LeftIcon={getIcon(field.icon)}
                text={field.label}
                contextualText={getFieldMetadataTypeLabel(field.type)}
                hasSubMenu={hasNestedFields(field)}
              />
            ))}
          </DropdownMenuItemsContainer>
        </ScrollWrapper>
      </StyledContainer>
    </DropdownContent>
  );
};
