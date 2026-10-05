import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type SpreadsheetImportFieldOption } from '@/spreadsheet-import/types/SpreadsheetImportFieldOption';
import { getSubFieldOptions } from '@/spreadsheet-import/utils/spreadsheetImportGetSubFieldOptions';
import { SelectOptionIcon } from '@/ui/input/components/SelectOptionIcon';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { type SelectOption } from 'twenty-ui/primitives/input';

type MatchColumnSelectSubFieldSelectDropdownContentProps = {
  fieldMetadataItem: FieldMetadataItem;
  selectedValue: SelectOption | undefined;
  onSubFieldSelect: (subFieldName: string) => void;
  options: readonly Readonly<SpreadsheetImportFieldOption>[];
};

export const MatchColumnSelectSubFieldSelectDropdownContent = ({
  fieldMetadataItem,
  selectedValue,
  onSubFieldSelect,
  options,
}: MatchColumnSelectSubFieldSelectDropdownContentProps) => {
  const [searchFilter, setSearchFilter] = useState('');
  const { t } = useLingui();
  const subFieldOptions = getSubFieldOptions(
    fieldMetadataItem,
    options,
    searchFilter,
  );

  return (
    <>
      <Dropdown.Back aria-label={t`${fieldMetadataItem.label}, back to fields`}>
        {fieldMetadataItem.label}
      </Dropdown.Back>
      <Dropdown.Search
        value={searchFilter}
        onValueChange={setSearchFilter}
        placeholder={t`Search fields`}
        aria-label={t`Search fields`}
      />
      <Dropdown.Separator />
      <Dropdown.Section scrollable>
        {subFieldOptions.map(
          ({ value, shortLabelForNestedField, Icon, disabled }) => (
            <Dropdown.OptionItem
              key={value}
              onSelect={() => onSubFieldSelect(value)}
              selected={selectedValue?.value === value}
              startIcon={<SelectOptionIcon Icon={Icon} />}
              disabled={disabled}
            >
              {shortLabelForNestedField}
            </Dropdown.OptionItem>
          ),
        )}
      </Dropdown.Section>
      {!isNonEmptyArray(subFieldOptions) && (
        <Dropdown.Empty>{t`No fields found`}</Dropdown.Empty>
      )}
    </>
  );
};
