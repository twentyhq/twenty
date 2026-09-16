import { type IconComponent } from 'twenty-ui/icon';
import {
  type ButtonAccent,
  type ButtonVariant,
} from 'twenty-ui/primitives/input';

export type SettingsBillingPlanAction = {
  accent?: ButtonAccent;
  disabled?: boolean;
  Icon?: IconComponent;
  isLoading?: boolean;
  onClick?: () => void;
  title: string;
  variant: ButtonVariant;
};

export type SettingsBillingPlanActionType =
  | 'CANCEL_INTERVAL_SWITCH_FIRST'
  | 'CANCEL_PLAN_SWITCH_FIRST'
  | 'CONTACT_ADMIN'
  | 'CURRENT'
  | 'MANAGE_BILLING'
  | 'SCHEDULED'
  | 'SWITCH_INTERVAL'
  | 'SWITCH_INTERVAL_FIRST'
  | 'SWITCH_PLAN'
  | 'UNAVAILABLE'
  | 'UPDATE_PAYMENT';
