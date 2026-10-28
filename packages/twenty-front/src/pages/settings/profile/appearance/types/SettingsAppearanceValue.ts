import { type SALESFARCE_APPEARANCE_VALUE } from '@/salesfarce/constants/SalesfarceAppearanceValue';
import { type ColorScheme } from '@/ui/theme/types/ColorScheme';

export type SettingsAppearanceValue =
  | ColorScheme
  | typeof SALESFARCE_APPEARANCE_VALUE;
