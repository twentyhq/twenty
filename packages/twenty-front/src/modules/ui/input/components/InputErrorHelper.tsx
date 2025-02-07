import React from 'react';
import styled from '@emotion/styled';

const StyledInputErrorHelper = styled.div`
  color: ${({ theme }) => theme.color.red};
  font-size: ${({ theme }) => theme.font.size.xs};
`;

export const InputErrorHelper = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <StyledInputErrorHelper aria-live="polite">{children}</StyledInputErrorHelper>
);
