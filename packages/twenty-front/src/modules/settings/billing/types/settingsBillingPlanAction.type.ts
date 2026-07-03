import { type IconComponent } from 'twenty-ui/icon';
import { type ButtonAccent, type ButtonVariant } from 'twenty-ui/input';

export type SettingsBillingPlanAction = {
  accent?: ButtonAccent;
  disabled?: boolean;
  Icon?: IconComponent;
  isLoading?: boolean;
  onClick?: () => void;
  title: string;
  variant: ButtonVariant;
};
