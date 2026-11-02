import { IconChevronRight } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

export const SettingsApplicationTableRowChevronIcon = () => {
  const theme = useTheme();

  return (
    <IconChevronRight
      size={theme.icon.size.md}
      stroke={theme.icon.stroke.sm}
      color={theme.font.color.light}
    />
  );
};
