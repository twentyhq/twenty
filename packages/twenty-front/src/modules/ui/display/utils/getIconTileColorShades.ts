import { TINTED_ICON_TILE_COLOR_SHADES } from '@/ui/display/constants/tintedIconTileColorShades.constant';
import { getColorFromTheme } from '@/ui/display/utils/getColorFromTheme';
import { parseThemeColor } from '@/ui/display/utils/parseThemeColor';

export type IconTileColorShades = {
  backgroundColor: string;
  iconColor: string;
  borderColor: string;
};

export const getIconTileColorShades = (
  color: string | null | undefined,
): IconTileColorShades => {
  const themeColor = parseThemeColor(color);
  return {
    backgroundColor: getColorFromTheme(
      themeColor,
      TINTED_ICON_TILE_COLOR_SHADES.background,
    ),
    iconColor: getColorFromTheme(
      themeColor,
      TINTED_ICON_TILE_COLOR_SHADES.icon,
    ),
    borderColor: getColorFromTheme(
      themeColor,
      TINTED_ICON_TILE_COLOR_SHADES.border,
    ),
  };
};
