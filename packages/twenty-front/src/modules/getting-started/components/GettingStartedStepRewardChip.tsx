import { currentUserState } from '@/auth/states/currentUserState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { OnboardingCreditsRewardChip } from '@/onboarding/components/OnboardingCreditsRewardChip';
import { formatOnboardingCredits } from '@/onboarding/utils/formatOnboardingCredits';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';

import { GettingStartedStep } from '~/generated-metadata/graphql';

type GettingStartedStepRewardChipProps = {
  step: GettingStartedStep;
  isCompleted: boolean;
};

export const GettingStartedStepRewardChip = ({
  step,
  isCompleted,
}: GettingStartedStepRewardChipProps) => {
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const currentUser = useAtomStateValue(currentUserState);
  const { numberFormat } = useNumberFormat();

  const isMailboxReward =
    step === GettingStartedStep.CONNECT_MAILBOX &&
    !isCompleted &&
    currentUser?.isWorkspaceCreator === true;
  const isInviteReward = step === GettingStartedStep.INVITE_TEAM;

  if (!isDefined(onboardingConfig) || (!isMailboxReward && !isInviteReward)) {
    return null;
  }

  return (
    <OnboardingCreditsRewardChip
      formattedCreditsReward={formatOnboardingCredits(
        isInviteReward
          ? onboardingConfig.inviteTeamCreditsRewardPerUser
          : onboardingConfig.importContactsCreditsReward,
        numberFormat,
      )}
      isRewardPerItem={isInviteReward}
    />
  );
};
