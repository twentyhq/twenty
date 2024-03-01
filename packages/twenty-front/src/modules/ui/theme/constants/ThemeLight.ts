import { ACCENT_LIGHT } from '@/ui/theme/constants/AccentLight';
import { BACKGROUND_LIGHT } from '@/ui/theme/constants/BackgroundLight';
import { BORDER_LIGHT } from '@/ui/theme/constants/BorderLight';
import { BOX_SHADOW_LIGHT } from '@/ui/theme/constants/BoxShadowLight';
import { FONT_LIGHT } from '@/ui/theme/constants/FontLight';
import { TAG_LIGHT } from '@/ui/theme/constants/TagLight';
import { THEME_COMMON } from '@/ui/theme/constants/ThemeCommon';

export const THEME_LIGHT = {
  ...THEME_COMMON,
  ...{
    accent: ACCENT_LIGHT,
    background: BACKGROUND_LIGHT,
    border: BORDER_LIGHT,
    tag: TAG_LIGHT,
    boxShadow: BOX_SHADOW_LIGHT,
    font: FONT_LIGHT,
    name: 'light',
  },
};

export type ThemeType = typeof THEME_LIGHT;
