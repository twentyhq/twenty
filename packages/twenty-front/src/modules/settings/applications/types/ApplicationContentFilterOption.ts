import { type ThemeColor } from 'twenty-ui/theme';

export type ApplicationContentFilterOption = {
  universalIdentifier: string;
  label: string;
  icon?: string | null;
  color?: ThemeColor;
};
