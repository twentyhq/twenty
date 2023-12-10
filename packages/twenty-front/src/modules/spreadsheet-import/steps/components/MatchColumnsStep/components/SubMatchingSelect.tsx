import styled from '@emotion/styled';

import { MatchColumnSelect } from '@/spreadsheet-import/components/MatchColumnSelect';
import { useSpreadsheetImportInternal } from '@/spreadsheet-import/hooks/useSpreadsheetImportInternal';
import { SelectOption } from '@/spreadsheet-import/types';
import { getFieldOptions } from '@/spreadsheet-import/utils/getFieldOptions';

import {
  MatchedOptions,
  MatchedSelectColumn,
  MatchedSelectOptionsColumn,
} from '../MatchColumnsStep';

const StyledContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledSelectLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(1)};
`;

interface SubMatchingSelectProps<T> {
  option: MatchedOptions<T> | Partial<MatchedOptions<T>>;
  column: MatchedSelectColumn<T> | MatchedSelectOptionsColumn<T>;
  onSubChange: (val: T, index: number, option: string) => void;
}

export const SubMatchingSelect = <T extends string>({
  option,
  column,
  onSubChange,
}: SubMatchingSelectProps<T>) => {
  const { fields } = useSpreadsheetImportInternal<T>();
  const options = getFieldOptions(fields, column.value) as SelectOption[];
  const value = options.find((opt) => opt.value === option.value);

  return (
    <StyledContainer>
      <StyledSelectLabel>{option.entry}</StyledSelectLabel>
      <MatchColumnSelect
        value={value}
        placeholder="Select..."
        onChange={(value) =>
          onSubChange(value?.value as T, column.index, option.entry ?? '')
        }
        options={options}
        name={option.entry}
      />
    </StyledContainer>
  );
};
