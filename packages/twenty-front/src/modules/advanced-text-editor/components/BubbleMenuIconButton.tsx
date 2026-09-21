import React from 'react';
import { isDefined } from 'twenty-shared/utils';
import type { IconComponent } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/components';

type BubbleMenuIconButtonProps = {
  label: string;
  className?: string;
  Icon?: IconComponent;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
};

export const BubbleMenuIconButton = ({
  label,
  className,
  Icon,
  disabled = false,
  onClick,
  isActive,
}: BubbleMenuIconButtonProps) => {
  return (
    <LightIconButton
      className={className}
      disabled={disabled}
      aria-pressed={isActive}
      onClick={onClick}
      emphasis={isActive === true ? 'standard' : 'subtle'}
      size="sm"
      aria-label={label}
    >
      {isDefined(Icon) && <Icon />}
    </LightIconButton>
  );
};
