import { OnboardingCreditsRewardChip } from '@/onboarding/components/OnboardingCreditsRewardChip';
import { getOnboardingCreditsRewardAriaLabel } from '@/onboarding/utils/getOnboardingCreditsRewardAriaLabel';
import { type Ref } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MainButton } from 'twenty-ui/components';
import { type IconComponent } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

type OnboardingRewardMainButtonProps = {
  label: string;
  Icon?: IconComponent;
  creditsReward: number;
  onClick: () => void;
  ref?: Ref<HTMLButtonElement>;
};

export const OnboardingRewardMainButton = ({
  label,
  Icon,
  creditsReward,
  onClick,
  ref,
}: OnboardingRewardMainButtonProps) => {
  const theme = useTheme();

  return (
    <MainButton
      ref={ref}
      fullWidth
      onClick={onClick}
      startIcon={
        isDefined(Icon) ? <Icon size={theme.icon.size.md} /> : undefined
      }
      endIcon={
        creditsReward > 0 ? (
          <OnboardingCreditsRewardChip creditsReward={creditsReward} />
        ) : undefined
      }
      aria-label={getOnboardingCreditsRewardAriaLabel({
        label,
        creditsReward,
      })}
    >
      {label}
    </MainButton>
  );
};
