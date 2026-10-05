import { type IconComponent } from 'twenty-ui/icon';
import {
  type ButtonColor,
  type ButtonVariant,
} from 'twenty-ui/primitives/input';

export type SettingsBillingPlanAction = {
  color?: ButtonColor;
  disabled?: boolean;
  Icon?: IconComponent;
  isLoading?: boolean;
  onClick?: () => void;
  title: string;
  variant: ButtonVariant;
};
