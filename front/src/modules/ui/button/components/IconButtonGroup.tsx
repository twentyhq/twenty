import React from 'react';
import styled from '@emotion/styled';

import { IconButtonSize, IconButtonVariant } from './IconButton';
const StyledIconButtonGroupContainer = styled.div`
  align-items: flex-start;
  background: ${({ theme }) => theme.background.transparent.primary};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(0.5)};
`;

type IconButtonGroupProps = {
  variant: IconButtonVariant;
  size: IconButtonSize;
  children: React.ReactElement[];
};

export function IconButtonGroup({
  children,
  variant,
  size,
}: IconButtonGroupProps) {
  return (
    <StyledIconButtonGroupContainer>
      {React.Children.map(children, (child) =>
        React.cloneElement(child, {
          ...(variant ? { variant } : {}),
          ...(size ? { size } : {}),
        }),
      )}
    </StyledIconButtonGroupContainer>
  );
}
