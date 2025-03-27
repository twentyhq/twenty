import { IconComponent, ThemeColor } from 'twenty-ui';

export type SelectOption = {
  // Icon
  icon?: IconComponent | null;
  // UI-facing option label
  label: string;
  // Field entry matching criteria as well as select output
  value: string;
  // Disabled option when already select
  disabled?: boolean;
  // Option color
  color?: ThemeColor | 'transparent';
};
