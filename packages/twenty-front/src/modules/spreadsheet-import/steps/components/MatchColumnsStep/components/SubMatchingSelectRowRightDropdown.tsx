import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';

import { getFieldOptions } from '@/spreadsheet-import/utils/getFieldOptions';

import { SubMatchingSelectDropdownButton } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectDropdownButton';
import { SubMatchingSelectInput } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectInput';
import {
  type SpreadsheetMatchedSelectColumn,
  type SpreadsheetMatchedSelectOptionsColumn,
} from '@/spreadsheet-import/types/SpreadsheetColumn';
import { type SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components';
import { styled } from '@linaria/react';
import { type SelectOption } from 'twenty-ui/primitives/input';

const StyledDropdownContainer = styled.div`
  width: 100%;
`;

type SubMatchingSelectRowRightDropdownProps = {
  option: SpreadsheetMatchedOptions | Partial<SpreadsheetMatchedOptions>;
  column:
    | SpreadsheetMatchedSelectColumn
    | SpreadsheetMatchedSelectOptionsColumn;
  onSubChange: (val: string, index: number, option: string) => void;
  placeholder: string;
  selectedOption?:
    | SpreadsheetMatchedOptions
    | Partial<SpreadsheetMatchedOptions>;
};

export const SubMatchingSelectRowRightDropdown = ({
  option,
  column,
  onSubChange,
  placeholder,
}: SubMatchingSelectRowRightDropdownProps) => {
  const entry = option.entry ?? '';
  const dropdownId = `sub-matching-select-dropdown-${column.index}-${entry}`;

  const { t } = useLingui();

  const { spreadsheetImportFields: fields } = useSpreadsheetImportInternal();
  const options = getFieldOptions(fields, column.value);
  const value = options.find(
    (fieldOption) => fieldOption.value === option.value,
  );

  const handleSelect = (selectedOption: SelectOption) => {
    onSubChange(selectedOption.value, column.index, entry);
  };

  return (
    <StyledDropdownContainer>
      <DropdownRoot dropdownId={dropdownId} type="picker">
        <Dropdown.Trigger render={<div />} nativeButton={false}>
          <SubMatchingSelectDropdownButton
            column={column}
            option={option}
            placeholder={placeholder}
          />
        </Dropdown.Trigger>
        <DropdownContent align="start" aria-label={t`Match ${entry}`}>
          <SubMatchingSelectInput
            selectedOption={value}
            options={options}
            onOptionSelected={handleSelect}
          />
        </DropdownContent>
      </DropdownRoot>
    </StyledDropdownContainer>
  );
};
