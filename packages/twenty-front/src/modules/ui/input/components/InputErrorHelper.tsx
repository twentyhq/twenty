import styled from '@emotion/styled';
import React from 'react';

const StyledInputErrorHelper = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.xs};
  margin-top: ${({ theme }) => theme.spacing(0.5)};
`;

export const InputErrorHelper = ({
  children,
}: {
  children?: React.ReactNode;
}) =>
  children ? (
    <StyledInputErrorHelper aria-live="polite">
      {children}
    </StyledInputErrorHelper>
  ) : null;
