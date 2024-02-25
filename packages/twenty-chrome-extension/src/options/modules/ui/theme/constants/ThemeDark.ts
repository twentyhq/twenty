import { ACCENT_DARK } from '@/ui/theme/constants/AccentDark';
import { BACKGROUND_DARK } from '@/ui/theme/constants/BackgroundDark';
import { BORDER_DARK } from '@/ui/theme/constants/BorderDark';
import { BOX_SHADOW_DARK } from '@/ui/theme/constants/BoxShadowDark';
import { FONT_DARK } from '@/ui/theme/constants/FontDark';
import { TAG_DARK } from '@/ui/theme/constants/TagDark';
import { THEME_COMMON } from '@/ui/theme/constants/ThemeCommon';
import { ThemeType } from '@/ui/theme/constants/ThemeLight';

export const THEME_DARK: ThemeType = {
  ...THEME_COMMON,
  ...{
    accent: ACCENT_DARK,
    background: BACKGROUND_DARK,
    border: BORDER_DARK,
    tag: TAG_DARK,
    boxShadow: BOX_SHADOW_DARK,
    font: FONT_DARK,
    name: 'dark',
  },
};
