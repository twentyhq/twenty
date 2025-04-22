import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { SubMatchingSelectControlContainer } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectControlContainer';
import {
  SpreadsheetMatchedSelectColumn,
  SpreadsheetMatchedSelectOptionsColumn,
} from '@/spreadsheet-import/types/SpreadsheetColumn';

import { SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';
import { getFieldOptions } from '@/spreadsheet-import/utils/getFieldOptions';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { Tag, TagColor } from 'twenty-ui/components';
import { IconChevronDown } from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';
const StyledIconChevronDown = styled(IconChevronDown)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

export type SubMatchingSelectDropdownButtonProps<T> = {
  option: SpreadsheetMatchedOptions<T> | Partial<SpreadsheetMatchedOptions<T>>;
  column:
    | SpreadsheetMatchedSelectColumn<T>
    | SpreadsheetMatchedSelectOptionsColumn<T>;
  placeholder: string;
};

export const SubMatchingSelectDropdownButton = <T extends string>({
  option,
  column,
  placeholder,
}: SubMatchingSelectDropdownButtonProps<T>) => {
  const { openDropdown } = useDropdown();

  const { fields } = useSpreadsheetImportInternal<T>();
  const options = getFieldOptions(fields, column.value) as SelectOption[];
  const value = options.find((opt) => opt.value === option.value);

  const theme = useTheme();

  return (
    <SubMatchingSelectControlContainer
      cursor="pointer"
      onClick={() => openDropdown()}
      id="control"
    >
      <Tag
        text={value?.label ?? placeholder}
        color={value?.color as TagColor}
      />
      <StyledIconChevronDown size={theme.icon.size.md} />
    </SubMatchingSelectControlContainer>
  );
};
