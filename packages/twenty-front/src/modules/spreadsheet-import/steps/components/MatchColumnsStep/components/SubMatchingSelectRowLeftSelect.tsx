import { SubMatchingSelectControlContainer } from '@/spreadsheet-import/steps/components/MatchColumnsStep/components/SubMatchingSelectControlContainer';

import { SpreadsheetMatchedOptions } from '@/spreadsheet-import/types/SpreadsheetMatchedOptions';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChevronDown } from 'twenty-ui';

const StyledIconChevronDown = styled(IconChevronDown)`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

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
  const theme = useTheme();

  return (
    <SubMatchingSelectControlContainer cursor="default">
      <StyledControlLabel>
        <StyledLabel>{option.entry}</StyledLabel>
      </StyledControlLabel>
      <StyledIconChevronDown
        size={theme.font.size.md}
        color={theme.font.color.tertiary}
      />
    </SubMatchingSelectControlContainer>
  );
};
