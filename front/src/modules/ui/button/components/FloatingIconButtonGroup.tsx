import React from 'react';
import styled from '@emotion/styled';

import {
  FloatingIconButtonPosition,
  FloatingIconButtonProps,
} from './FloatingIconButton';

const StyledFloatingIconButtonGroupContainer = styled.div`
  backdrop-filter: blur(20px);
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) =>
    `0px 2px 4px 0px ${theme.background.transparent.light}, 0px 0px 4px 0px ${theme.background.transparent.medium}`};
  display: flex;
`;

export type FloatingIconButtonGroupProps = Pick<
  FloatingIconButtonProps,
  'size'
> & {
  children: React.ReactElement[];
};

export function FloatingIconButtonGroup({
  children,
  size,
}: FloatingIconButtonGroupProps) {
  return (
    <StyledFloatingIconButtonGroupContainer>
      {React.Children.map(children, (child, index) => {
        let position: FloatingIconButtonPosition;

        if (index === 0) {
          position = 'left';
        } else if (index === children.length - 1) {
          position = 'right';
        } else {
          position = 'middle';
        }

        const additionalProps: any = {
          position,
          applyShadow: false,
          applyBlur: false,
        };

        if (size) {
          additionalProps.size = size;
        }

        return React.cloneElement(child, additionalProps);
      })}
    </StyledFloatingIconButtonGroupContainer>
  );
}
