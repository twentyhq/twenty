import { styled } from '@linaria/react';
import React from 'react';
import type { IconComponent } from 'twenty-ui/display';
import { FloatingIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type BubbleMenuIconButtonProps = {
  className?: string;
  Icon?: IconComponent;
  disabled?: boolean;
  focus?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
};

const StyledBubbleMenuIconButtonContainer = styled.div`
  border: none;
  border-radius: ${themeCssVariables.spacing[1.5]};
  width: ${themeCssVariables.spacing[6]};
  height: ${themeCssVariables.spacing[6]};
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
    <StyledBubbleMenuIconButtonContainer className={className}>
      <FloatingIconButton
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
    </StyledBubbleMenuIconButtonContainer>
  );
};
