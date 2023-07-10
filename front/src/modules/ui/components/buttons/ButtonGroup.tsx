import React from 'react';
import styled from '@emotion/styled';

import { ButtonPosition } from './Button';

const StyledButtonGroupContainer = styled.div`
  border-radius: 8px;
  display: flex;
`;

type ButtonGroupProps = {
  children: React.ReactElement[];
};

export function ButtonGroup({ children }: ButtonGroupProps) {
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

        console.log(React.cloneElement(child, { position }));
        return React.cloneElement(child, { position });
      })}
    </StyledButtonGroupContainer>
  );
}
