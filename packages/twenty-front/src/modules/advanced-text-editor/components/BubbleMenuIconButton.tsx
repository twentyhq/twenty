import React from 'react';
import { LightIconButton } from 'twenty-ui/components';
import { type IconComponent } from 'twenty-ui/icon';

type BubbleMenuIconButtonProps = {
  className?: string;
  Icon?: IconComponent;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  isActive?: boolean;
};

export const BubbleMenuIconButton = ({
  className,
  Icon,
  disabled = false,
  onClick,
  isActive,
}: BubbleMenuIconButtonProps) => {
  return (
    <LightIconButton
      className={className}
      Icon={Icon}
      disabled={disabled}
      onClick={onClick}
      accent={isActive === true ? 'secondary' : 'tertiary'}
      size="small"
    />
  );
};
