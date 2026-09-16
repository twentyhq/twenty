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

export type SettingsBillingPlanActionType =
  | 'CANCEL_INTERVAL_SWITCH'
  | 'CANCEL_PLAN_SWITCH'
  | 'CONTACT_ADMIN'
  | 'CURRENT'
  | 'MANAGE_BILLING'
  | 'SCHEDULED'
  | 'SWITCH_INTERVAL'
  | 'SWITCH_INTERVAL_FIRST'
  | 'SWITCH_PLAN'
  | 'UNAVAILABLE'
  | 'UPDATE_PAYMENT';
