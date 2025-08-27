import styled from '@emotion/styled';
import React from 'react';

const StyledInputErrorHelper = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.xs};
  position: absolute;
  margin-top: ${({ theme }) => theme.spacing(0.25)};
`;

export const InputErrorHelper = ({
  children,
}: {
  children?: React.ReactNode;
}) => (
  <div>
    {children && (
      <StyledInputErrorHelper aria-live="polite">
        {children}
      </StyledInputErrorHelper>
    )}
  </div>
);
