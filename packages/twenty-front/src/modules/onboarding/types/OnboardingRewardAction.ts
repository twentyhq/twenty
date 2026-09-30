import { type IconComponent } from 'twenty-ui/icon';

export type OnboardingRewardAction = {
  label: string;
  Icon?: IconComponent;
  onClick: () => void;
};
