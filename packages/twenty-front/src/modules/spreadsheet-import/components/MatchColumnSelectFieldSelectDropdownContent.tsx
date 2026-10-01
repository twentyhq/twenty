import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { getFieldMetadataTypeLabel } from '@/object-record/object-filter-dropdown/utils/getFieldMetadataTypeLabel';
import { DO_NOT_IMPORT_OPTION_KEY } from '@/spreadsheet-import/constants/DoNotImportOptionKey';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { hasNestedFields } from '@/spreadsheet-import/utils/spreadsheetImportHasNestedFields';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown, useDropdownPage } from 'twenty-ui/components';
import { IconForbid, useIcons } from 'twenty-ui/icon';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { type ReadonlyDeep } from 'type-fest';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

const StyledContainer = styled.div`
  max-height: 360px;
  overflow-y: auto;
`;

type MatchColumnSelectFieldSelectDropdownContentProps = {
  selectedValue: SelectOption | undefined;
  onSelectFieldMetadataItem: (fieldMetadataItem: FieldMetadataItem) => void;
  onSelectSuggestedOption: (suggestedOption: SelectOption) => void;
  onDoNotImportSelect: () => void;
  suggestedOptions: readonly ReadonlyDeep<
    SelectOption & { fieldMetadataTypeLabel?: string }
  >[];
};

export const MatchColumnSelectFieldSelectDropdownContent = ({
  selectedValue,
  onSelectFieldMetadataItem,
  onSelectSuggestedOption,
  onDoNotImportSelect,
  suggestedOptions,
}: MatchColumnSelectFieldSelectDropdownContentProps) => {
  const [searchFilter, setSearchFilter] = useState('');
  const { availableFieldMetadataItems, spreadsheetImportFields } =
    useSpreadsheetImportInternal();
  const { goToPage } = useDropdownPage();
  const { getIcon } = useIcons();
  const { t } = useLingui();

  const importableFieldMetadataItemIds = new Set(
    spreadsheetImportFields.map((field) => field.fieldMetadataItemId),
  );
  const searchTerm = normalizeSearchText(searchFilter);
  const filteredAvailableFieldMetadataItems =
    availableFieldMetadataItems.filter(
      (field) =>
        importableFieldMetadataItemIds.has(field.id) &&
        (normalizeSearchText(field.label).includes(searchTerm) ||
          normalizeSearchText(field.name).includes(searchTerm)),
    );
  const filteredSuggestedOptions = suggestedOptions.filter((option) =>
    normalizeSearchText(option.label).includes(searchTerm),
  );
  const shouldShowDoNotImport = normalizeSearchText(t`Do not import`).includes(
    searchTerm,
  );
  const hasSuggestedOptions = isNonEmptyArray(filteredSuggestedOptions);
  const hasAvailableFields = isNonEmptyArray(
    filteredAvailableFieldMetadataItems,
  );

  const handleFieldSelect = (fieldMetadataItem: FieldMetadataItem) => {
    onSelectFieldMetadataItem(fieldMetadataItem);

    if (hasNestedFields(fieldMetadataItem)) {
      goToPage('sub-field');
    }
  };

  return (
    <>
      <Dropdown.Header>
        <Dropdown.Title>{t`Select matching field`}</Dropdown.Title>
        <Dropdown.Close aria-label={t`Cancel field selection`} />
      </Dropdown.Header>
      <Dropdown.Search
        value={searchFilter}
        onValueChange={setSearchFilter}
        placeholder={t`Search fields`}
        aria-label={t`Search fields`}
      />
      <Dropdown.Separator />
      <StyledContainer>
        {shouldShowDoNotImport && (
          <Dropdown.Section>
            <Dropdown.OptionItem
              onSelect={onDoNotImportSelect}
              selected={selectedValue?.value === DO_NOT_IMPORT_OPTION_KEY}
              startIcon={<SelectOptionIcon Icon={IconForbid} />}
            >{t`Do not import`}</Dropdown.OptionItem>
          </Dropdown.Section>
        )}
        {shouldShowDoNotImport && hasSuggestedOptions && <Dropdown.Separator />}
        {hasSuggestedOptions && (
          <Dropdown.Section label={t`Suggested`}>
            {filteredSuggestedOptions.map((option) => (
              <Dropdown.OptionItem
                key={option.value}
                onSelect={() => onSelectSuggestedOption(option)}
                selected={selectedValue?.value === option.value}
                description={option.fieldMetadataTypeLabel}
                startIcon={<SelectOptionIcon Icon={option.Icon} />}
              >
                {option.label}
              </Dropdown.OptionItem>
            ))}
          </Dropdown.Section>
        )}
        {(shouldShowDoNotImport || hasSuggestedOptions) &&
          hasAvailableFields && <Dropdown.Separator />}
        {hasAvailableFields && (
          <Dropdown.Section label={t`All fields`}>
            {filteredAvailableFieldMetadataItems.map((field) => (
              <Dropdown.OptionItem
                key={field.id}
                onSelect={() => handleFieldSelect(field)}
                selected={selectedValue?.value === field.name}
                closeOnSelect={!hasNestedFields(field)}
                hasSubmenu={hasNestedFields(field)}
                description={getFieldMetadataTypeLabel(field.type)}
                startIcon={<SelectOptionIcon Icon={getIcon(field.icon)} />}
              >
                {field.label}
              </Dropdown.OptionItem>
            ))}
          </Dropdown.Section>
        )}
        {!shouldShowDoNotImport &&
          !hasSuggestedOptions &&
          !hasAvailableFields && (
            <Dropdown.Empty>{t`No fields found`}</Dropdown.Empty>
          )}
      </StyledContainer>
    </>
  );
};
