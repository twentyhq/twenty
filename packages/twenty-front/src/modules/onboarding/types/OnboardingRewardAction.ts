import { type IconComponent } from 'twenty-ui/icon';

export type OnboardingRewardAction = {
  label: string;
  Icon?: IconComponent;
  creditsReward: number;
  isRewardPerItem?: boolean;
  onClick: () => void;
};
