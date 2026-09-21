import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { TintedIconTile } from 'twenty-ui/primitives/data-display';
import { type ThemeColor } from 'twenty-ui/theme';
import { useTheme } from 'twenty-ui/theme-constants';

type SelectOptionIconProps = {
  Icon?: IconComponent | null;
  color?: ThemeColor | null;
};

export const SelectOptionIcon = ({ Icon, color }: SelectOptionIconProps) => {
  const theme = useTheme();

  if (!isDefined(Icon)) {
    return null;
  }

  if (isDefined(color)) {
    return (
      <TintedIconTile
        Icon={Icon}
        color={color}
        size={theme.icon.size.md}
        stroke={theme.icon.stroke.sm}
      />
    );
  }

  return <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />;
};
