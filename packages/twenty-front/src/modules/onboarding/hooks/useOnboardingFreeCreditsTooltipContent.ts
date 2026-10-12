import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';
import { type OnboardingFreeCreditsTooltipContent } from '@/onboarding/types/OnboardingFreeCreditsTooltipContent';
import { formatOnboardingCredits } from '@/onboarding/utils/formatOnboardingCredits';
import { getOnboardingCreditWorth } from '@/onboarding/utils/getOnboardingCreditWorth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';

type UseOnboardingFreeCreditsTooltipContentArgs = {
  currentStep: OnboardingCreditsStep | null;
  newlyEarnedCredits: number;
  isFirstCreditsGain: boolean;
};

export const useOnboardingFreeCreditsTooltipContent = ({
  currentStep,
  newlyEarnedCredits,
  isFirstCreditsGain,
}: UseOnboardingFreeCreditsTooltipContentArgs): OnboardingFreeCreditsTooltipContent | null => {
  const { t } = useLingui();
  const { formatNumber, numberFormat } = useNumberFormat();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);

  if (!isDefined(onboardingConfig)) {
    return null;
  }

  const {
    aiActions: importContactsAiActions,
    enrichments: importContactsEnrichments,
    callRecordingHours: importContactsCallRecordingHours,
  } = getOnboardingCreditWorth(onboardingConfig.importContactsCreditsReward);
  const formattedImportContactsAiActions = formatNumber(
    importContactsAiActions,
  );
  const formattedImportContactsEnrichments = formatNumber(
    importContactsEnrichments,
  );
  const formattedImportContactsCallRecordingHours = formatNumber(
    importContactsCallRecordingHours,
    { decimals: 1 },
  );
  const formattedNewlyEarnedAiActions = formatNumber(
    getOnboardingCreditWorth(newlyEarnedCredits).aiActions,
  );
  const formattedImportContactsCreditsReward = formatOnboardingCredits(
    onboardingConfig.importContactsCreditsReward,
    numberFormat,
  );
  const formattedInviteTeamCreditsRewardPerUser = formatOnboardingCredits(
    onboardingConfig.inviteTeamCreditsRewardPerUser,
    numberFormat,
  );
  const formattedUpgradeCreditsReward = formatOnboardingCredits(
    onboardingConfig.upgradeCreditsReward,
    numberFormat,
  );
  const formattedNewlyEarnedCredits = formatOnboardingCredits(
    newlyEarnedCredits,
    numberFormat,
  );

  const helperByStep: Record<
    OnboardingCreditsStep,
    OnboardingFreeCreditsTooltipContent | null
  > = {
    importContacts: {
      title: plural(onboardingConfig.importContactsCreditsReward, {
        one: `Connect your mailbox to earn ${formattedImportContactsCreditsReward} free credit`,
        other: `Connect your mailbox to earn ${formattedImportContactsCreditsReward} free credits`,
      }),
      description: plural(importContactsCallRecordingHours, {
        one: `${formattedImportContactsAiActions} AI actions, ${formattedImportContactsEnrichments} enrichments or ${formattedImportContactsCallRecordingHours} hour of call recording.`,
        other: `${formattedImportContactsAiActions} AI actions, ${formattedImportContactsEnrichments} enrichments or ${formattedImportContactsCallRecordingHours} hours of call recording.`,
      }),
    },
    createProfile: null,
    inviteTeam: {
      title: plural(onboardingConfig.inviteTeamCreditsRewardPerUser, {
        one: `Earn ${formattedInviteTeamCreditsRewardPerUser} free credit per teammate who joins`,
        other: `Earn ${formattedInviteTeamCreditsRewardPerUser} free credits per teammate who joins`,
      }),
      description: t`Credits are added when they accept your invite.`,
    },
    upgradeTrial: {
      title: plural(onboardingConfig.upgradeCreditsReward, {
        one: `Upgrade your trial to earn ${formattedUpgradeCreditsReward} free credit`,
        other: `Upgrade your trial to earn ${formattedUpgradeCreditsReward} free credits`,
      }),
      description: t`Credits are added when your trial starts.`,
    },
  };

  const currentStepHelper = isDefined(currentStep)
    ? helperByStep[currentStep]
    : null;

  if (isDefined(currentStepHelper)) {
    return currentStepHelper;
  }

  return newlyEarnedCredits > 0 && isFirstCreditsGain
    ? {
        title: plural(newlyEarnedCredits, {
          one: `You earned ${formattedNewlyEarnedCredits} free credit`,
          other: `You earned ${formattedNewlyEarnedCredits} free credits`,
        }),
        description: t`That's about ${formattedNewlyEarnedAiActions} AI actions. Credits never expire.`,
      }
    : null;
};
