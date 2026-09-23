import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { OnboardingFreeCreditsPopoverContent } from '@/onboarding/components/free-credits/OnboardingFreeCreditsPopoverContent';
import { OnboardingFreeCreditsProgressBar } from '@/onboarding/components/free-credits/OnboardingFreeCreditsProgressBar';
import { ONBOARDING_CREDIT_WORTH_PER_CREDIT } from '@/onboarding/constants/OnboardingCreditWorthPerCredit';
import { ONBOARDING_NEWLY_EARNED_CREDITS_DISPLAY_DURATION_S } from '@/onboarding/constants/OnboardingNewlyEarnedCreditsDisplayDurationS';
import { useOnboardingCreditRewards } from '@/onboarding/hooks/useOnboardingCreditRewards';
import { onboardingSeenFreeCreditsByWorkspaceIdState } from '@/onboarding/states/onboardingSeenFreeCreditsByWorkspaceIdState';
import { type OnboardingCreditsStep } from '@/onboarding/types/OnboardingCreditsStep';
import { getOnboardingCreditsProgress } from '@/onboarding/utils/getOnboardingCreditsProgress';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconCoins, IconInfoCircle } from 'twenty-ui/icon';
import { Popover, Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledNewlyEarnedCredits = styled(motion.span)`
  color: ${themeCssVariables.color.green9};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledPillAnchor = styled.div`
  display: flex;
`;

const StyledTrigger = styled.button`
  align-items: center;
  background: none;
  border: none;
  border-radius: ${themeCssVariables.border.radius.pill};
  color: ${themeCssVariables.font.color.tertiary};
  corner-shape: round;
  cursor: pointer;
  display: flex;
  font-family: inherit;
  padding: 0;

  &:hover > span,
  &[data-popup-open] > span {
    background-color: ${themeCssVariables.background.quaternary};
  }
`;

const StyledTriggerPart = styled.span`
  align-items: center;
  background-color: ${themeCssVariables.background.tertiary};
  border: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  corner-shape: round;
  display: flex;
  height: ${themeCssVariables.spacing[6]};
  transition:
    background-color calc(${themeCssVariables.animation.duration.normal} * 1s),
    border-color calc(${themeCssVariables.animation.duration.normal} * 1s),
    color calc(${themeCssVariables.animation.duration.normal} * 1s);

  &[data-highlighted='true'] {
    background-color: ${themeCssVariables.color.green3};
    border-color: ${themeCssVariables.color.green4};
    color: ${themeCssVariables.color.green9};
  }
`;

const StyledCreditsPart = styled(StyledTriggerPart)`
  border-bottom-left-radius: ${themeCssVariables.border.radius.pill};
  border-right: none;
  border-top-left-radius: ${themeCssVariables.border.radius.pill};
  gap: ${themeCssVariables.spacing['1.5']};
  padding: 0 ${themeCssVariables.spacing[2]} 0
    ${themeCssVariables.spacing['1.5']};
`;

const StyledInfoPart = styled(StyledTriggerPart)`
  border-bottom-right-radius: ${themeCssVariables.border.radius.rounded};
  border-top-right-radius: ${themeCssVariables.border.radius.rounded};
  justify-content: center;
  padding: 0 ${themeCssVariables.spacing['1.5']} 0
    ${themeCssVariables.spacing[1]};
`;

const StyledCreditsText = styled.span`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  white-space: nowrap;
`;

const StyledCreditsCount = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-variant-numeric: tabular-nums;
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledCreditsLabel = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
`;

type OnboardingFreeCreditsTooltipContent = {
  title: string;
  description: string;
};

type OnboardingFreeCreditsProps = {
  onboardingConfig: OnboardingConfig;
};

export const OnboardingFreeCredits = ({
  onboardingConfig,
}: OnboardingFreeCreditsProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const shouldReduceMotion = useReducedMotion();
  const { formatNumber } = useNumberFormat();
  const creditRewards = useOnboardingCreditRewards();
  const currentUser = useAtomStateValue(currentUserState);
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const [
    onboardingSeenFreeCreditsByWorkspaceId,
    setOnboardingSeenFreeCreditsByWorkspaceId,
  ] = useAtomState(onboardingSeenFreeCreditsByWorkspaceIdState);
  const [isPopoverShown, setIsPopoverShown] = useState(false);
  const pillAnchorRef = useRef<HTMLDivElement>(null);

  if (!isDefined(creditRewards) || !isDefined(currentWorkspace)) {
    return null;
  }

  const progress = getOnboardingCreditsProgress({
    creditRewards,
    onboardingConfig,
    onboardingStatus: currentUser?.onboardingStatus,
    isFirstWorkspaceMember: currentWorkspace.workspaceMembersCount === 1,
  });

  if (progress.goalCredits <= 0) {
    return null;
  }

  const formatCredits = (credits: number) =>
    formatNumber(credits, { decimals: 2 });

  const { earnedCredits, goalCredits, currentStep } = progress;

  const previouslySeenCredits =
    onboardingSeenFreeCreditsByWorkspaceId[currentWorkspace.id] ?? 0;
  const newlyEarnedCredits = earnedCredits - previouslySeenCredits;
  const hasNewlyEarnedCredits = newlyEarnedCredits > 0;

  const markCreditsAsSeen = () =>
    setOnboardingSeenFreeCreditsByWorkspaceId((seenFreeCredits) => ({
      ...seenFreeCredits,
      [currentWorkspace.id]: earnedCredits,
    }));

  const isEarningFirstCredits =
    currentStep === 'importContacts' && earnedCredits === 0;
  const isHighlighted = isEarningFirstCredits || hasNewlyEarnedCredits;

  const formattedImportContactsReward = formatCredits(
    onboardingConfig.importContactsCreditsReward,
  );
  const formattedNewlyEarnedAiActions = formatNumber(
    Math.floor(
      newlyEarnedCredits * ONBOARDING_CREDIT_WORTH_PER_CREDIT.aiActions,
    ),
  );

  const helperByStep: Record<
    OnboardingCreditsStep,
    OnboardingFreeCreditsTooltipContent
  > = {
    importContacts: {
      title: plural(onboardingConfig.importContactsCreditsReward, {
        one: 'Connect your mailbox to earn # free credit',
        other: 'Connect your mailbox to earn # free credits',
      }),
      description: t`Credits pay for AI, workflows and emails in Twenty.`,
    },
    installApps: {
      title: plural(onboardingConfig.installAppsCreditsRewardPerApp, {
        one: 'Earn # free credit per app you install',
        other: 'Earn # free credits per app you install',
      }),
      description: t`Apps like enrichment and call recording run on credits.`,
    },
    inviteTeam: {
      title: plural(onboardingConfig.inviteTeamCreditsRewardPerUser, {
        one: 'Earn # free credit per teammate who joins',
        other: 'Earn # free credits per teammate who joins',
      }),
      description: t`Credits are added when they accept your invite.`,
    },
  };

  // The helper stays up while its step can still earn credits, so it reads as
  // guidance rather than a hover detail. Fresh credits take its place briefly.
  const tooltipContent: OnboardingFreeCreditsTooltipContent | null =
    hasNewlyEarnedCredits
      ? {
          title: plural(newlyEarnedCredits, {
            one: 'You earned # free credit',
            other: 'You earned # free credits',
          }),
          description: t`That's about ${formattedNewlyEarnedAiActions} AI actions. Credits never expire.`,
        }
      : isDefined(currentStep)
        ? helperByStep[currentStep]
        : null;

  return (
    <StyledContainer>
      <AnimatePresence>
        {hasNewlyEarnedCredits && (
          <StyledNewlyEarnedCredits
            key={earnedCredits}
            initial={{
              opacity: 0,
              scale: shouldReduceMotion ? 1 : 0.6,
              x: shouldReduceMotion ? 0 : 8,
            }}
            animate={{ opacity: [0, 1, 1], scale: 1, x: 0 }}
            exit={{
              opacity: 0,
              y: shouldReduceMotion ? 0 : -8,
              transition: { duration: theme.animation.duration.normal },
            }}
            transition={{
              opacity: {
                duration: ONBOARDING_NEWLY_EARNED_CREDITS_DISPLAY_DURATION_S,
                times: [0, 0.1, 1],
              },
              scale: { type: 'spring', stiffness: 500, damping: 14 },
              x: { duration: theme.animation.duration.normal },
            }}
            onAnimationComplete={markCreditsAsSeen}
          >
            {`+${formatCredits(newlyEarnedCredits)}`}
          </StyledNewlyEarnedCredits>
        )}
      </AnimatePresence>
      <StyledPillAnchor ref={pillAnchorRef}>
        <Popover.Root
          onOpenChange={(open) => {
            if (open) {
              setIsPopoverShown(true);
            }
          }}
          onOpenChangeComplete={(open) => {
            if (!open) {
              setIsPopoverShown(false);
            }
          }}
        >
          <Popover.Trigger openOnHover render={<StyledTrigger />}>
            <StyledCreditsPart data-highlighted={isHighlighted}>
              <IconCoins size={theme.icon.size.md} color="currentColor" />
              {isEarningFirstCredits ? (
                <StyledCreditsText>
                  <StyledCreditsCount>{t`Earn ${formattedImportContactsReward}`}</StyledCreditsCount>
                  <StyledCreditsLabel>
                    {plural(onboardingConfig.importContactsCreditsReward, {
                      one: 'free credit',
                      other: 'free credits',
                    })}
                  </StyledCreditsLabel>
                </StyledCreditsText>
              ) : (
                <>
                  <OnboardingFreeCreditsProgressBar
                    earnedCredits={earnedCredits}
                    pendingCredits={progress.pendingCredits}
                    creditsLeftInStep={progress.currentStepCredits}
                    goalCredits={goalCredits}
                    previouslySeenCredits={previouslySeenCredits}
                    isHighlighted={isHighlighted}
                  />
                  <StyledCreditsText>
                    <StyledCreditsCount>
                      {`${formatCredits(earnedCredits)}/${formatCredits(goalCredits)}`}
                    </StyledCreditsCount>
                    <StyledCreditsLabel>
                      {plural(goalCredits, {
                        one: 'free credit',
                        other: 'free credits',
                      })}
                    </StyledCreditsLabel>
                  </StyledCreditsText>
                </>
              )}
            </StyledCreditsPart>
            <StyledInfoPart data-highlighted={isHighlighted}>
              <IconInfoCircle size={theme.icon.size.md} color="currentColor" />
            </StyledInfoPart>
          </Popover.Trigger>
          <Popover.Popup side="bottom" align="end" aria-label={t`Free credits`}>
            <OnboardingFreeCreditsPopoverContent
              progress={progress}
              creditRewards={creditRewards}
              onboardingConfig={onboardingConfig}
            />
          </Popover.Popup>
        </Popover.Root>
      </StyledPillAnchor>
      <Tooltip.Root open={!isPopoverShown && isDefined(tooltipContent)}>
        <Tooltip.Popup anchor={pillAnchorRef} side="bottom" align="end" arrow>
          <Tooltip.Content description={tooltipContent?.description}>
            {tooltipContent?.title}
          </Tooltip.Content>
        </Tooltip.Popup>
      </Tooltip.Root>
    </StyledContainer>
  );
};
