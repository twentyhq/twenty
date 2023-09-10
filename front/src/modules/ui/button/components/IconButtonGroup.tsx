import type { MouseEvent } from 'react';
import styled from '@emotion/styled';

import type { IconComponent } from '@/ui/icon/types/IconComponent';

import { Button } from './Button';
import { IconButtonPosition, type IconButtonProps } from './IconButton';

const StyledIconButtonGroupContainer = styled.div`
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
`;

export type IconButtonGroupProps = Pick<
  IconButtonProps,
  'accent' | 'size' | 'variant'
> & {
  iconButtons: {
    Icon: IconComponent;
    onClick?: (event: MouseEvent<any>) => void;
  }[];
};

export function IconButtonGroup({
  accent,
  iconButtons,
  size,
  variant,
}: IconButtonGroupProps) {
  return (
    <StyledIconButtonGroupContainer>
      {iconButtons.map(({ Icon, onClick }, index) => {
        const position: IconButtonPosition =
          index === 0
            ? 'left'
            : index === iconButtons.length - 1
            ? 'right'
            : 'middle';

        return (
          <Button
            accent={accent}
            Icon={Icon}
            onClick={onClick}
            position={position}
            size={size}
            variant={variant}
          />
        );
      })}
    </StyledIconButtonGroupContainer>
  );
}
