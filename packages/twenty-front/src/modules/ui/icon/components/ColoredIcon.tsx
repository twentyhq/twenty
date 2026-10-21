import { getIconTileColorShades } from 'twenty-ui/components/data-display';
import { type IconComponent } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

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
      size={size ?? theme.icon.size.md}
      stroke={stroke ?? theme.icon.stroke.md}
      color={getIconTileColorShades(color).iconColor}
    />
  );
};
