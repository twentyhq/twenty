import styled from '@emotion/styled';
import React from 'react';

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
}: {
  children?: React.ReactNode;
}) => (
  <StyledErrorContainer>
    {children && (
      <StyledInputErrorHelper aria-live="polite">
        {children}
      </StyledInputErrorHelper>
    )}
  </StyledErrorContainer>
);
