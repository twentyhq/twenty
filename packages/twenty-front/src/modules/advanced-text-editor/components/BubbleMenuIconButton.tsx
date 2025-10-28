import styled from '@emotion/styled';
import React from 'react';
import type { IconComponent } from 'twenty-ui/display';
import { FloatingIconButton } from 'twenty-ui/input';

type BubbleMenuIconButtonProps = {
  className?: string;
  Icon?: IconComponent;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
};

const StyledBubbleMenuIconButton = styled(FloatingIconButton)`
  border: none;
  border-radius: ${({ theme }) => theme.spacing(1.5)};
  width: ${({ theme }) => theme.spacing(6)};
  height: ${({ theme }) => theme.spacing(6)};
`;

export const BubbleMenuIconButton = ({
  className,
  Icon,
  disabled = false,
  focus = false,
  onClick,
  isActive,
}: BubbleMenuIconButtonProps) => {
  return (
    <StyledBubbleMenuIconButton
      className={className}
      Icon={Icon}
      disabled={disabled}
      focus={focus}
      onClick={onClick}
      isActive={isActive}
      applyShadow={false}
      applyBlur={false}
      size="medium"
      position="standalone"
    />
  );
};
