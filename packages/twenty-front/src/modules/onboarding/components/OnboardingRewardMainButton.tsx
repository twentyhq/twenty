import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { OnboardingCreditsRewardChip } from '@/onboarding/components/OnboardingCreditsRewardChip';
import { type OnboardingRewardAction } from '@/onboarding/types/OnboardingRewardAction';
import { formatOnboardingCredits } from '@/onboarding/utils/formatOnboardingCredits';
import { getOnboardingCreditsRewardAriaLabel } from '@/onboarding/utils/getOnboardingCreditsRewardAriaLabel';
import { type Ref } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { MainButton } from 'twenty-ui/components';
import { Loader } from 'twenty-ui/primitives/feedback';
import { useTheme } from 'twenty-ui/theme';

type OnboardingRewardMainButtonProps = OnboardingRewardAction & {
  creditsReward: number;
  isRewardPerItem?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  ref?: Ref<HTMLButtonElement>;
};

export const OnboardingRewardMainButton = ({
  label,
  Icon,
  creditsReward,
  isRewardPerItem = false,
  disabled = false,
  isLoading = false,
  onClick,
  ref,
}: OnboardingRewardMainButtonProps) => {
  const theme = useTheme();
  const { numberFormat } = useNumberFormat();
  const formattedCreditsReward = formatOnboardingCredits(
    creditsReward,
    numberFormat,
  );

  const getStartIcon = () => {
    if (isLoading) {
      return <Loader />;
    }

    return isDefined(Icon) ? <Icon size={theme.icon.size.md} /> : undefined;
  };

  return (
    <MainButton
      ref={ref}
      fullWidth
      disabled={disabled}
      onClick={onClick}
      startIcon={getStartIcon()}
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
