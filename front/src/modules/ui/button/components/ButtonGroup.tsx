import React from 'react';
import styled from '@emotion/styled';

import { ButtonPosition, ButtonProps } from './Button';

const StyledButtonGroupContainer = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
`;

export type ButtonGroupProps = Pick<
  ButtonProps,
  'variant' | 'size' | 'accent'
> & {
  children: React.ReactElement[];
};

export function ButtonGroup({
  children,
  variant,
  size,
  accent,
}: ButtonGroupProps) {
  return (
    <StyledButtonGroupContainer>
      {React.Children.map(children, (child, index) => {
        let position: ButtonPosition;

        if (index === 0) {
          position = 'left';
        } else if (index === children.length - 1) {
          position = 'right';
        } else {
          position = 'middle';
        }

        const additionalProps: any = { position, variant, accent, size };

        if (variant) {
          additionalProps.variant = variant;
        }

        if (accent) {
          additionalProps.variant = variant;
        }

        if (size) {
          additionalProps.size = size;
        }

        return React.cloneElement(child, additionalProps);
      })}
    </StyledButtonGroupContainer>
  );
}
