import {
  BORDER_COMMON,
  OverflowingTextWithTooltip,
  THEME_COMMON,
} from 'twenty-ui';

import { FieldArrayValue } from '@/object-record/record-field/types/FieldMetadata';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import styled from '@emotion/styled';

type ArrayDisplayProps = {
  value: FieldArrayValue;
  isFocused?: boolean;
  isInputDisplay?: boolean;
};

const themeSpacing = THEME_COMMON.spacingMultiplicator;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeSpacing * 1}px;
  justify-content: flex-start;

  max-width: 100%;

  overflow: hidden;

  width: 100%;
`;

const StyledTag = styled.div<{ isInputDisplay?: boolean }>`
  background-color: ${({ theme, isInputDisplay }) =>
    isInputDisplay ? 'transparent' : theme.background.tertiary};
  padding: ${({ theme }) => theme.spacing(1)} ${({ theme }) => theme.spacing(2)};
  border-radius: ${BORDER_COMMON.radius.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
`;

export const ArrayDisplay = ({
  value,
  isFocused,
  isInputDisplay = false,
}: ArrayDisplayProps) => {
  return isFocused ? (
    <ExpandableList isChipCountDisplayed>
      {value?.map((item, index) => (
        <StyledTag key={index}>
          <OverflowingTextWithTooltip text={item} />
        </StyledTag>
      ))}
    </ExpandableList>
  ) : (
    <StyledContainer>
      {value?.map((item, index) => (
        <StyledTag key={index} isInputDisplay={isInputDisplay}>
          <OverflowingTextWithTooltip text={item} />
        </StyledTag>
      ))}
    </StyledContainer>
  );
};
