import { OnboardingCreditsRewardChip } from '@/onboarding/components/OnboardingCreditsRewardChip';
import { type OnboardingRewardAction } from '@/onboarding/types/OnboardingRewardAction';
import { getOnboardingCreditsRewardAriaLabel } from '@/onboarding/utils/getOnboardingCreditsRewardAriaLabel';
import { type Ref } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MainButton } from 'twenty-ui/components';
import { useTheme } from 'twenty-ui/theme';

type OnboardingRewardMainButtonProps = OnboardingRewardAction & {
  creditsReward: number;
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
