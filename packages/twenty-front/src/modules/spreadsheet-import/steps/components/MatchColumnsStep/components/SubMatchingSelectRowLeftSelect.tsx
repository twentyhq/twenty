import { SubMatchingSelectControlContainer } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectControlContainer';

import { type SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';
import styled from '@emotion/styled';

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledControlLabel = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
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
