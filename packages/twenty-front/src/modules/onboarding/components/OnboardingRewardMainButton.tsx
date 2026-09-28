import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { OnboardingCreditsRewardChip } from '@/onboarding/components/OnboardingCreditsRewardChip';
import { type OnboardingRewardAction } from '@/onboarding/types/OnboardingRewardAction';
import { formatOnboardingCredits } from '@/onboarding/utils/formatOnboardingCredits';
import { getOnboardingCreditsRewardAriaLabel } from '@/onboarding/utils/getOnboardingCreditsRewardAriaLabel';
import { type Ref } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MainButton } from 'twenty-ui/components';
import { useTheme } from 'twenty-ui/theme';

type OnboardingRewardMainButtonProps = OnboardingRewardAction & {
  creditsReward: number;
  isRewardPerItem?: boolean;
  ref?: Ref<HTMLButtonElement>;
};

export const OnboardingRewardMainButton = ({
  label,
  Icon,
  creditsReward,
  isRewardPerItem = false,
  onClick,
  ref,
}: OnboardingRewardMainButtonProps) => {
  const theme = useTheme();
  const { numberFormat } = useNumberFormat();
  const formattedCreditsReward = formatOnboardingCredits(
    creditsReward,
    numberFormat,
  );

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
          <OnboardingCreditsRewardChip
            formattedCreditsReward={formattedCreditsReward}
            isRewardPerItem={isRewardPerItem}
          />
        ) : undefined
      }
      aria-label={getOnboardingCreditsRewardAriaLabel({
        label,
        creditsReward,
        formattedCreditsReward,
        isRewardPerItem,
      })}
    >
      {label}
    </MainButton>
  );
};
