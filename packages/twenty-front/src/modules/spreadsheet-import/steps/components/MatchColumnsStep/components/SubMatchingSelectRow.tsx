import { SubMatchingSelectRowLeftSelect } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectRowLeftSelect';
import { SubMatchingSelectRowRightDropdown } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectRowRightDropdown';
import {
  type SpreadsheetMatchedSelectColumn,
  type SpreadsheetMatchedSelectOptionsColumn,
} from '@/spreadsheet-import/types/SpreadsheetColumn';
import { type SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';
import styled from '@emotion/styled';

const StyledRowContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(4)};
  justify-content: space-between;
  padding-bottom: ${({ theme }) => theme.spacing(1)};
`;

interface SubMatchingSelectRowProps {
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
export const SubMatchingSelectRow = ({
  option,
  column,
  onSubChange,
  placeholder,
}: SubMatchingSelectRowProps) => {
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
