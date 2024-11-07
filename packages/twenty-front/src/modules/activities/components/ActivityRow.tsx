import styled from '@emotion/styled';
import { CardContent } from 'twenty-ui';
import React from 'react';

const StyledRowContent = styled(CardContent)<{
  clickable?: boolean;
}>`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: ${({ theme }) => theme.spacing(12)};
  padding: ${({ theme }) => theme.spacing(0, 4)};
  cursor: ${({ clickable }) => (clickable === true ? 'pointer' : 'default')};
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
    <StyledRowContent onClick={handleClick} clickable={disabled !== true}>
      {children}
    </StyledRowContent>
  );
};
