import { SubMatchingSelectRowLeftSelect } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectRowLeftSelect';
import { SubMatchingSelectRowRightDropdown } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectRowRightDropdown';
import {
  type SpreadsheetMatchedOptions,
  type SpreadsheetMatchedSelectColumn,
  type SpreadsheetMatchedSelectOptionsColumn,
} from 'twenty-shared/utils';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRowContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[4]};
  justify-content: space-between;
  padding-bottom: ${themeCssVariables.spacing[1]};
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
