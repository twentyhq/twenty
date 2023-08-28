import React from 'react';
import styled from '@emotion/styled';

import { IconButtonPosition, IconButtonProps } from './IconButton';

const StyledIconButtonGroupContainer = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
`;

export type IconButtonGroupProps = Pick<
  IconButtonProps,
  'variant' | 'size' | 'accent'
> & {
  children: React.ReactElement[];
};

export function IconButtonGroup({
  children,
  variant,
  size,
  accent,
}: IconButtonGroupProps) {
  return (
    <StyledIconButtonGroupContainer>
      {React.Children.map(children, (child, index) => {
        let position: IconButtonPosition;

        if (index === 0) {
          position = 'left';
        } else if (index === children.length - 1) {
          position = 'right';
        } else {
          position = 'middle';
        }

        const additionalProps: any = { position };

        if (variant) {
          additionalProps.variant = variant;
        }

        if (accent) {
          additionalProps.accent = accent;
        }

        if (size) {
          additionalProps.size = size;
        }

        return React.cloneElement(child, additionalProps);
      })}
    </StyledIconButtonGroupContainer>
  );
}
