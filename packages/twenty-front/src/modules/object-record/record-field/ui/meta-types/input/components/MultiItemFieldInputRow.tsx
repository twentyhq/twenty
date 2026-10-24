import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledInputRow = styled.div<{ isInRow: boolean; isInFooter: boolean }>`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  gap: ${({ isInRow }) => (isInRow ? themeCssVariables.spacing[1] : '0')};
  height: ${({ isInRow }) => (isInRow ? themeCssVariables.spacing[8] : 'auto')};
  margin: ${({ isInRow, isInFooter }) =>
    isInRow && isInFooter ? themeCssVariables.spacing[1] : '0'};
  min-height: ${themeCssVariables.spacing[8]};
  width: ${({ isInRow, isInFooter }) =>
    isInRow && isInFooter ? 'auto' : '100%'};
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
  isInFooter?: boolean;
};

export const MultiItemFieldInputRow = ({
  children,
  rightComponent,
  isInRow = false,
  isInFooter = false,
}: MultiItemFieldInputRowProps) => (
  <StyledInputRow isInRow={isInRow} isInFooter={isInFooter}>
    {children}
    {isDefined(rightComponent) && (
      <StyledRightContainer isInRow={isInRow}>
        {rightComponent}
      </StyledRightContainer>
    )}
  </StyledInputRow>
);
