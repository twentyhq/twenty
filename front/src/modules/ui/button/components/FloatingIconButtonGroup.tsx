import type { MouseEvent } from 'react';
import styled from '@emotion/styled';

import type { IconComponent } from '@/ui/icon/types/IconComponent';

import {
  FloatingIconButton,
  FloatingIconButtonPosition,
  type FloatingIconButtonProps,
} from './FloatingIconButton';

const StyledFloatingIconButtonGroupContainer = styled.div`
  backdrop-filter: blur(20px);
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) =>
    `0px 2px 4px 0px ${theme.background.transparent.light}, 0px 0px 4px 0px ${theme.background.transparent.medium}`};
  display: flex;
  gap: 2px;
  padding: 2px;
`;

export type FloatingIconButtonGroupProps = Pick<
  FloatingIconButtonProps,
  'className' | 'size'
> & {
  iconButtons: {
    Icon: IconComponent;
    onClick?: (event: MouseEvent<any>) => void;
  }[];
};

export function FloatingIconButtonGroup({
  iconButtons,
  size,
}: FloatingIconButtonGroupProps) {
  return (
    <StyledFloatingIconButtonGroupContainer>
      {iconButtons.map(({ Icon, onClick }, index) => {
        const position: FloatingIconButtonPosition =
          index === 0
            ? 'left'
            : index === iconButtons.length - 1
            ? 'right'
            : 'middle';

        return (
          <FloatingIconButton
            applyBlur={false}
            applyShadow={false}
            Icon={Icon}
            onClick={onClick}
            position={position}
            size={size}
          />
        );
      })}
    </StyledFloatingIconButtonGroupContainer>
  );
}
