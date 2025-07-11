import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { SubMatchingSelectControlContainer } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectControlContainer';
import {
  SpreadsheetMatchedSelectColumn,
  SpreadsheetMatchedSelectOptionsColumn,
} from '@/spreadsheet-import/types/SpreadsheetColumn';

import { SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';
import { getFieldOptions } from '@/spreadsheet-import/utils/getFieldOptions';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Tag, TagColor } from 'twenty-ui/components';
import { IconChevronDown } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
const StyledIconChevronDown = styled(IconChevronDown)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export type SubMatchingSelectDropdownButtonProps = {
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
  const { spreadsheetImportFields: fields } = useSpreadsheetImportInternal();
  const options = getFieldOptions(fields, column.value) as SelectOption[];
  const value = options.find((opt) => opt.value === option.value);

  const theme = useTheme();

  return (
    <SubMatchingSelectControlContainer cursor="pointer" id="control">
      <Tag
        text={value?.label ?? placeholder}
        color={value?.color as TagColor}
      />
      <StyledIconChevronDown size={theme.icon.size.md} />
    </SubMatchingSelectControlContainer>
  );
};
