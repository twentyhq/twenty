import { isDefined } from 'twenty-shared/utils';
import { TintedIconTile } from 'twenty-ui/components/data-display';
import { type IconComponent } from 'twenty-ui/icon';
import { type ThemeColor, useTheme } from 'twenty-ui/theme';

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
        icon={<Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />}
        color={color}
        style={{ width: theme.icon.size.md, height: theme.icon.size.md }}
      />
    );
  }

  return <Icon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />;
};
