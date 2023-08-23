import React, { ReactNode } from 'react';
import styled from '@emotion/styled';

import { ButtonPosition, ButtonProps } from './Button';

const StyledButtonGroupContainer = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
`;

type ButtonGroupProps = Pick<ButtonProps, 'variant' | 'size'> & {
  children: ReactNode[];
};

export function ButtonGroup({ children, variant, size }: ButtonGroupProps) {
  return (
    <StyledButtonGroupContainer>
      {React.Children.map(children, (child, index) => {
        if (!React.isValidElement(child)) return null;

        let position: ButtonPosition;

        if (index === 0) {
          position = ButtonPosition.Left;
        } else if (index === children.length - 1) {
          position = ButtonPosition.Right;
        } else {
          position = ButtonPosition.Middle;
        }

        const additionalProps: any = { position };

        if (variant) {
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
