import { SubMatchingSelectControlContainer } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectControlContainer';

import { SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';
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

export type SubMatchingSelectRowLeftSelectProps<T> = {
  option: SpreadsheetMatchedOptions<T> | Partial<SpreadsheetMatchedOptions<T>>;
};

export const SubMatchingSelectRowLeftSelect = <T extends string>({
  option,
}: SubMatchingSelectRowLeftSelectProps<T>) => {
  return (
    <SubMatchingSelectControlContainer cursor="default">
      <StyledControlLabel>
        <StyledLabel>{option.entry}</StyledLabel>
      </StyledControlLabel>
    </SubMatchingSelectControlContainer>
  );
};
