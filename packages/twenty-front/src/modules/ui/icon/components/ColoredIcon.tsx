import { css } from '@linaria/core';
import { type IconComponent } from 'twenty-ui/icon';
import { getIconTileColorShades } from 'twenty-ui/primitives/data-display';
import { useTheme } from 'twenty-ui/theme-constants';

const iconClassName = css`
  flex-shrink: 0;
`;

type ColoredIconProps = {
  Icon: IconComponent;
  color?: string | null;
  size?: number;
  stroke?: number;
};

export const ColoredIcon = ({
  Icon,
  color,
  size,
  stroke,
}: ColoredIconProps) => {
  const theme = useTheme();

  return (
    <Icon
      className={iconClassName}
      size={size ?? theme.icon.size.md}
      stroke={stroke ?? theme.icon.stroke.md}
      color={getIconTileColorShades(color).iconColor}
    />
  );
};
