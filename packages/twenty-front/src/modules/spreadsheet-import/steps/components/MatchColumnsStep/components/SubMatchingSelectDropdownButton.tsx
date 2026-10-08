import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { SubMatchingSelectControlContainer } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectControlContainer';
import {
  type SpreadsheetMatchedSelectColumn,
  type SpreadsheetMatchedSelectOptionsColumn,
} from '@/spreadsheet-import/types/SpreadsheetColumn';

import { type SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';
import { getFieldOptions } from '@/spreadsheet-import/utils/getFieldOptions';
import { styled } from '@linaria/react';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';
import { Tag, type TagColor } from 'twenty-ui/primitives/data-display';
import { IconChevronDown } from 'twenty-ui/icon';
const StyledIconChevronDownContainer = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
`;

type SubMatchingSelectDropdownButtonProps = {
  option: SpreadsheetMatchedOptions | Partial<SpreadsheetMatchedOptions>;
  column:
    | SpreadsheetMatchedSelectColumn
    | SpreadsheetMatchedSelectOptionsColumn;
  placeholder: string;
};

export const SubMatchingSelectDropdownButton = ({
  option,
  column,
  placeholder,
}: SubMatchingSelectDropdownButtonProps) => {
  const theme = useTheme();
  const { spreadsheetImportFields: fields } = useSpreadsheetImportInternal();
  const options = getFieldOptions(fields, column.value);
  const value = options.find(
    (fieldOption) => fieldOption.value === option.value,
  );
  return (
    <SubMatchingSelectControlContainer cursor="pointer">
      <Tag color={value?.color as TagColor}>{value?.label ?? placeholder}</Tag>
      <StyledIconChevronDownContainer>
        <IconChevronDown size={theme.icon.size.md} />
      </StyledIconChevronDownContainer>
    </SubMatchingSelectControlContainer>
  );
};
