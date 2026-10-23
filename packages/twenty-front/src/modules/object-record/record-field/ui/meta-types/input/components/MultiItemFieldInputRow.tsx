import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledInputRow = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  min-height: ${themeCssVariables.spacing[8]};
  width: 100%;

  &[data-in-row='true'] {
    gap: ${themeCssVariables.spacing[1]};
    height: ${themeCssVariables.spacing[8]};
  }

  &[data-in-row='true'][data-in-footer='true'] {
    margin: ${themeCssVariables.spacing[1]};
    width: auto;
  }
`;

const StyledRightContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  padding-inline-end: ${themeCssVariables.spacing[2]};

  &[data-in-row='true'] {
    padding-inline-end: ${themeCssVariables.spacing[1]};
  }
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
  <StyledInputRow data-in-row={isInRow} data-in-footer={isInFooter}>
    {children}
    {isDefined(rightComponent) && (
      <StyledRightContainer data-in-row={isInRow}>
        {rightComponent}
      </StyledRightContainer>
    )}
  </StyledInputRow>
);
