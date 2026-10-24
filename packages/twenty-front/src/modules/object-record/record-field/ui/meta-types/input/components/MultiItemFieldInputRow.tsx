import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const IN_ROW_HEIGHT = themeCssVariables.spacing[8];
const IN_ROW_WITH_INSET_HEIGHT = `calc(${themeCssVariables.spacing[8]} + 2 * ${themeCssVariables.spacing[1]})`;

const getInputRowHeight = ({
  isInRow,
  hasInset,
}: {
  isInRow: boolean;
  hasInset: boolean;
}) => {
  if (!isInRow) {
    return 'auto';
  }

  return hasInset ? IN_ROW_WITH_INSET_HEIGHT : IN_ROW_HEIGHT;
};

const StyledInputRow = styled.div<{ isInRow: boolean; hasInset: boolean }>`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  gap: ${({ isInRow }) => (isInRow ? themeCssVariables.spacing[1] : '0')};
  height: ${getInputRowHeight};
  min-height: ${themeCssVariables.spacing[8]};
  padding: ${({ hasInset }) => (hasInset ? themeCssVariables.spacing[1] : '0')};
  width: 100%;
`;

const StyledRightContainer = styled.div<{ isInRow: boolean }>`
  display: flex;
  flex-shrink: 0;
  padding-inline-end: ${({ isInRow }) =>
    isInRow ? themeCssVariables.spacing[1] : themeCssVariables.spacing[2]};
`;

type MultiItemFieldInputRowProps = {
  children: ReactNode;
  rightComponent?: ReactNode;
  isInRow?: boolean;
  hasInset?: boolean;
};

export const MultiItemFieldInputRow = ({
  children,
  rightComponent,
  isInRow = false,
  hasInset = false,
}: MultiItemFieldInputRowProps) => (
  <StyledInputRow isInRow={isInRow} hasInset={hasInset}>
    {children}
    {isDefined(rightComponent) && (
      <StyledRightContainer isInRow={isInRow}>
        {rightComponent}
      </StyledRightContainer>
    )}
  </StyledInputRow>
);
