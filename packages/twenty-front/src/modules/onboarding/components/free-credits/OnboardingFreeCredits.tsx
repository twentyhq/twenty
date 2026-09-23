import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { OnboardingFreeCreditsChecklistItem } from '@/onboarding/components/free-credits/OnboardingFreeCreditsChecklistItem';
import { ONBOARDING_NEWLY_EARNED_CREDITS_DISPLAY_DURATION_S } from '@/onboarding/constants/OnboardingNewlyEarnedCreditsDisplayDurationS';
import { useOnboardingCreditRewards } from '@/onboarding/hooks/useOnboardingCreditRewards';
import { onboardingSeenFreeCreditsByWorkspaceIdState } from '@/onboarding/states/onboardingSeenFreeCreditsByWorkspaceIdState';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { isDefined } from 'twenty-shared/utils';
import {
  IconApps,
  IconAt,
  IconBuildingSkyscraper,
  IconCoins,
  IconInfoCircle,
  IconUserPlus,
} from 'twenty-ui/icon';
import { Popover } from 'twenty-ui/primitives/surfaces';
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
  gap: ${themeCssVariables.spacing[1]};
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

const StyledCreditsCount = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledCreditsLabel = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledPopoverContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]};
  width: 280px;
`;

const StyledChecklist = styled.ul`
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: ${themeCssVariables.spacing[2]} 0 0;
  padding: 0;
`;

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
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const [
    onboardingSeenFreeCreditsByWorkspaceId,
    setOnboardingSeenFreeCreditsByWorkspaceId,
  ] = useAtomState(onboardingSeenFreeCreditsByWorkspaceIdState);

  if (!isDefined(creditRewards) || !isDefined(currentWorkspace)) {
    return null;
  }

  const formatCredits = (credits: number) =>
    formatNumber(credits, { decimals: 2 });

  const getEarnedCreditsLabel = (credits: number) =>
    credits > 0 ? `+${formatCredits(credits)}` : undefined;

  const {
    totalCredits,
    importContactsCredits,
    installAppsCredits,
    inviteTeamCredits,
    enrichmentQualificationCredits,
    pendingInvitationsCount,
  } = creditRewards;

  const newlyEarnedCredits =
    totalCredits -
    (onboardingSeenFreeCreditsByWorkspaceId[currentWorkspace.id] ?? 0);
  const hasNewlyEarnedCredits = newlyEarnedCredits > 0;

  // Only the first member of a workspace can still earn these two rewards.
  const isFirstWorkspaceMember = currentWorkspace.workspaceMembersCount === 1;

  const markCreditsAsSeen = () =>
    setOnboardingSeenFreeCreditsByWorkspaceId((seenFreeCredits) => ({
      ...seenFreeCredits,
      [currentWorkspace.id]: totalCredits,
    }));

  return (
    <StyledContainer>
      <AnimatePresence>
        {hasNewlyEarnedCredits && (
          <StyledNewlyEarnedCredits
            key={totalCredits}
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 4 }}
            animate={{ opacity: [0, 1, 1], y: 0 }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: {
                duration: ONBOARDING_NEWLY_EARNED_CREDITS_DISPLAY_DURATION_S,
                times: [0, 0.1, 1],
              },
              y: { duration: theme.animation.duration.normal },
            }}
            onAnimationComplete={markCreditsAsSeen}
          >
            {`+${formatCredits(newlyEarnedCredits)}`}
          </StyledNewlyEarnedCredits>
        )}
      </AnimatePresence>
      <Popover.Root>
        <Popover.Trigger openOnHover render={<StyledTrigger />}>
          <StyledCreditsPart data-highlighted={hasNewlyEarnedCredits}>
            <IconCoins size={theme.icon.size.md} color="currentColor" />
            {totalCredits > 0 ? (
              <>
                <StyledCreditsCount>
                  {formatCredits(totalCredits)}
                </StyledCreditsCount>
                <StyledCreditsLabel>
                  {plural(totalCredits, {
                    one: 'free credit',
                    other: 'free credits',
                  })}
                </StyledCreditsLabel>
              </>
            ) : (
              <StyledCreditsLabel>{t`Earn free credits`}</StyledCreditsLabel>
            )}
          </StyledCreditsPart>
          <StyledInfoPart data-highlighted={hasNewlyEarnedCredits}>
            <IconInfoCircle size={theme.icon.size.md} color="currentColor" />
          </StyledInfoPart>
        </Popover.Trigger>
        <Popover.Popup side="bottom" align="end">
          <StyledPopoverContent>
            <Popover.Title>{t`Free credits`}</Popover.Title>
            <Popover.Description>
              {t`Credits pay for AI, workflows and other usage in Twenty. Earned credits come on top of your plan and stay until you use them.`}
            </Popover.Description>
            <StyledChecklist>
              {(isFirstWorkspaceMember || importContactsCredits > 0) && (
                <OnboardingFreeCreditsChecklistItem
                  Icon={IconAt}
                  label={t`Connect your email`}
                  description={plural(
                    onboardingConfig.importContactsCreditsReward,
                    { one: '+# free credit', other: '+# free credits' },
                  )}
                  earnedCreditsLabel={getEarnedCreditsLabel(
                    importContactsCredits,
                  )}
                />
              )}
              {(isFirstWorkspaceMember || installAppsCredits > 0) && (
                <OnboardingFreeCreditsChecklistItem
                  Icon={IconApps}
                  label={t`Install apps`}
                  description={plural(
                    onboardingConfig.installAppsCreditsRewardPerApp,
                    {
                      one: '+# free credit per app installed',
                      other: '+# free credits per app installed',
                    },
                  )}
                  earnedCreditsLabel={getEarnedCreditsLabel(installAppsCredits)}
                />
              )}
              <OnboardingFreeCreditsChecklistItem
                Icon={IconUserPlus}
                label={t`Invite teammates`}
                description={plural(
                  onboardingConfig.inviteTeamCreditsRewardPerUser,
                  {
                    one: '+# free credit per teammate who joins',
                    other: '+# free credits per teammate who joins',
                  },
                )}
                earnedCreditsLabel={getEarnedCreditsLabel(inviteTeamCredits)}
                pendingLabel={
                  pendingInvitationsCount > 0
                    ? plural(pendingInvitationsCount, {
                        one: '# invite pending',
                        other: '# invites pending',
                      })
                    : undefined
                }
              />
              {enrichmentQualificationCredits > 0 && (
                <OnboardingFreeCreditsChecklistItem
                  Icon={IconBuildingSkyscraper}
                  label={t`Company bonus`}
                  description={t`Based on your company size`}
                  earnedCreditsLabel={getEarnedCreditsLabel(
                    enrichmentQualificationCredits,
                  )}
                />
              )}
            </StyledChecklist>
          </StyledPopoverContent>
        </Popover.Popup>
      </Popover.Root>
    </StyledContainer>
  );
};
