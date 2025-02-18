import React from 'react';
import styled from '@emotion/styled';

const StyledInputErrorHelper = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.xs};
  position: absolute;
`;

const StyledErrorContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

export const InputErrorHelper = ({
  children,
  isVisible = true,
}: {
  children?: React.ReactNode;
  isVisible?: boolean;
}) => (
  <StyledErrorContainer>
    {children && isVisible && (
      <StyledInputErrorHelper aria-live="polite">
        {children}
      </StyledInputErrorHelper>
    )}
  </StyledErrorContainer>
);
