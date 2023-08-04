import React, { type ComponentProps } from 'react';
import styled from '@emotion/styled';

import type { IconButtonSize, IconButtonVariant } from './IconButton';

const StyledIconButtonGroupContainer = styled.div`
  align-items: flex-start;
  background: ${({ theme }) => theme.background.transparent.primary};
  border-radius: ${({ theme }) => theme.spacing(1)};
  display: flex;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding: ${({ theme }) => theme.spacing(0.5)};
`;

type IconButtonGroupProps = Omit<ComponentProps<'div'>, 'children'> & {
  variant: IconButtonVariant;
  size: IconButtonSize;
  children: React.ReactElement | React.ReactElement[];
};

export function IconButtonGroup({
  children,
  variant,
  size,
  ...props
}: IconButtonGroupProps) {
  return (
    <StyledIconButtonGroupContainer {...props}>
      {React.Children.map(
        Array.isArray(children) ? children : [children],
        (child) =>
          React.cloneElement(child, {
            ...(variant ? { variant } : {}),
            ...(size ? { size } : {}),
          }),
      )}
    </StyledIconButtonGroupContainer>
  );
}
