import { SubMatchingSelectControlContainer } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectControlContainer';

import { type SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.regular};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledControlLabel = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

export type SubMatchingSelectRowLeftSelectProps = {
  option: SpreadsheetMatchedOptions | Partial<SpreadsheetMatchedOptions>;
};

export const SubMatchingSelectRowLeftSelect = ({
  option,
}: SubMatchingSelectRowLeftSelectProps) => {
  return (
    <SubMatchingSelectControlContainer cursor="default">
      <StyledControlLabel>
        <StyledLabel>{option.entry}</StyledLabel>
      </StyledControlLabel>
    </SubMatchingSelectControlContainer>
  );
};
