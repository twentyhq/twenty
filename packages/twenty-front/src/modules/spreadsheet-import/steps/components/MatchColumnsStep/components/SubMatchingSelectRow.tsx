import { SubMatchingSelectRowLeftSelect } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectRowLeftSelect';
import { SubMatchingSelectRowRightDropdown } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectRowRightDropdown';
import {
  SpreadsheetMatchedSelectColumn,
  SpreadsheetMatchedSelectOptionsColumn,
} from '@/spreadsheet-import/types/SpreadsheetColumn';
import { SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';
import styled from '@emotion/styled';

const StyledRowContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.spacing(1)};
`;

interface SubMatchingSelectRowProps<T> {
  option: SpreadsheetMatchedOptions<T> | Partial<SpreadsheetMatchedOptions<T>>;
  column:
    | SpreadsheetMatchedSelectColumn<T>
    | SpreadsheetMatchedSelectOptionsColumn<T>;
  onSubChange: (val: T, index: number, option: string) => void;
  placeholder: string;
  selectedOption?:
    | SpreadsheetMatchedOptions<T>
    | Partial<SpreadsheetMatchedOptions<T>>;
}
export const SubMatchingSelectRow = <T extends string>({
  option,
  column,
  onSubChange,
  placeholder,
}: SubMatchingSelectRowProps<T>) => {
  return (
    <StyledRowContainer>
      <SubMatchingSelectRowLeftSelect option={option} />
      <SubMatchingSelectRowRightDropdown
        column={column}
        onSubChange={onSubChange}
        option={option}
        placeholder={placeholder}
      />
    </StyledRowContainer>
  );
};
