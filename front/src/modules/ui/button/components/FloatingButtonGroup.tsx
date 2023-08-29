import React from 'react';
import styled from '@emotion/styled';

import { FloatingButtonPosition, FloatingButtonProps } from './FloatingButton';

const StyledFloatingButtonGroupContainer = styled.div`
  backdrop-filter: blur(20px);
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) =>
    `0px 2px 4px 0px ${theme.background.transparent.light}, 0px 0px 4px 0px ${theme.background.transparent.medium}`};
  display: flex;
`;

export type FloatingButtonGroupProps = Pick<FloatingButtonProps, 'size'> & {
  children: React.ReactElement[];
};

export function FloatingButtonGroup({
  children,
  size,
}: FloatingButtonGroupProps) {
  return (
    <StyledFloatingButtonGroupContainer>
      {React.Children.map(children, (child, index) => {
        let position: FloatingButtonPosition;

        if (index === 0) {
          position = 'left';
        } else if (index === children.length - 1) {
          position = 'right';
        } else {
          position = 'middle';
        }

        const additionalProps: any = {
          position,
          size,
          applyShadow: false,
          applyBlur: false,
        };

        if (size) {
          additionalProps.size = size;
        }

        return React.cloneElement(child, additionalProps);
      })}
    </StyledFloatingButtonGroupContainer>
  );
}
