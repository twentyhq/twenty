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

  &:not(:first-of-type) {
    padding: ${themeCssVariables.spacing[1]};
  }
`;

const StyledRightContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  padding-inline-end: ${themeCssVariables.spacing[2]};
`;

type MultiItemFieldInputRowProps = {
  children: ReactNode;
  rightComponent?: ReactNode;
  className?: string;
};

export const MultiItemFieldInputRow = ({
  children,
  rightComponent,
  className,
}: MultiItemFieldInputRowProps) => (
  <StyledInputRow className={className}>
    {children}
    {isDefined(rightComponent) && (
      <StyledRightContainer>{rightComponent}</StyledRightContainer>
    )}
  </StyledInputRow>
);
