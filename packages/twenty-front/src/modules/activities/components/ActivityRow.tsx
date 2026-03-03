import { styled } from '@linaria/react';
import React from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRowContent = styled.div<{ isClickable: boolean }>`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'default')};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[12]};
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[4]};
`;

export const ActivityRow = ({
  children,
  onClick,
  disabled,
}: React.PropsWithChildren<{
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
}>) => {
  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (disabled !== true) {
      onClick?.(event);
    }
  };

  return (
    <StyledRowContent onClick={handleClick} isClickable={disabled !== true}>
      {children}
    </StyledRowContent>
  );
};
