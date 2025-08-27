import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';

import { getFieldOptions } from '@/spreadsheet-import/utils/getFieldOptions';

import { SubMatchingSelectDropdownButton } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectDropdownButton';
import { SubMatchingSelectInput } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectInput';
import {
  type SpreadsheetMatchedSelectColumn,
  type SpreadsheetMatchedSelectOptionsColumn,
} from '@/spreadsheet-import/types/SpreadsheetColumn';
import { type SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import styled from '@emotion/styled';
import { type SelectOption } from 'twenty-ui/input';

const StyledDropdownContainer = styled.div`
  width: 100%;
`;

interface SubMatchingSelectRowRightDropdownProps {
  option: SpreadsheetMatchedOptions | Partial<SpreadsheetMatchedOptions>;
  column:
    | SpreadsheetMatchedSelectColumn
    | SpreadsheetMatchedSelectOptionsColumn;
  onSubChange: (val: string, index: number, option: string) => void;
  placeholder: string;
  selectedOption?:
    | SpreadsheetMatchedOptions
    | Partial<SpreadsheetMatchedOptions>;
}

export const SubMatchingSelectRowRightDropdown = ({
  option,
  column,
  onSubChange,
  placeholder,
}: SubMatchingSelectRowRightDropdownProps) => {
  const dropdownId = `sub-matching-select-dropdown-${option.entry}`;

  const { closeDropdown } = useCloseDropdown();

  const { spreadsheetImportFields: fields } = useSpreadsheetImportInternal();
  const options = getFieldOptions(fields, column.value) as SelectOption[];
  const value = options.find((opt) => opt.value === option.value);

  const handleSelect = (selectedOption: SelectOption) => {
    onSubChange(selectedOption.value, column.index, option.entry ?? '');
    closeDropdown(dropdownId);
  };

  return (
    <StyledDropdownContainer>
      <Dropdown
        dropdownId={dropdownId}
        dropdownPlacement="bottom-start"
        clickableComponent={
          <SubMatchingSelectDropdownButton
            column={column}
            option={option}
            placeholder={placeholder}
          />
        }
        dropdownComponents={
          <SubMatchingSelectInput
            defaultOption={value}
            options={options}
            onOptionSelected={handleSelect}
          />
        }
        isDropdownInModal
      />
    </StyledDropdownContainer>
  );
};
