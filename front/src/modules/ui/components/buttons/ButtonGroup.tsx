import React from 'react';
import styled from '@emotion/styled';

import { ButtonPosition, ButtonVariant } from './Button';

const StyledButtonGroupContainer = styled.div`
  border-radius: 8px;
  display: flex;
`;

type ButtonGroupProps = {
  children: React.ReactElement[];
  variant?: ButtonVariant;
};

export function ButtonGroup({ children, variant }: ButtonGroupProps) {
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

        if (variant) {
          return React.cloneElement(child, { position, variant });
        }

        return React.cloneElement(child, { position });
      })}
    </StyledButtonGroupContainer>
  );
}
