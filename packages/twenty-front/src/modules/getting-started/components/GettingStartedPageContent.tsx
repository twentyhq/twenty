import { currentUserState } from '@/auth/states/currentUserState';
import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { GettingStartedStepStack } from '@/getting-started/components/GettingStartedStepStack';
import { GETTING_STARTED_CONTENT_MAX_WIDTH } from '@/getting-started/constants/GettingStartedContentMaxWidth';
import { GETTING_STARTED_STEPS } from '@/getting-started/constants/GettingStartedSteps';
import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { useGettingStartedTrial } from '@/getting-started/hooks/useGettingStartedTrial';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { getGettingStartedCreditsToEarn } from '@/getting-started/utils/getGettingStartedCreditsToEarn';
import { getGettingStartedStepSelection } from '@/getting-started/utils/getGettingStartedStepSelection';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { formatDateISOStringToCustomUnicodeFormat } from '@/localization/utils/formatDateISOStringToCustomUnicodeFormat';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { OnboardingCreditsRewardChip } from '@/onboarding/components/OnboardingCreditsRewardChip';
import { formatOnboardingCredits } from '@/onboarding/utils/formatOnboardingCredits';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { NavigationButton } from '@/ui/input/components/NavigationButton';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Callout } from 'twenty-ui/components/feedback';
import { IconCheck, IconCreditCard, IconListCheck } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledScroll = styled.div`
  flex: 1;
  overflow: auto;
  padding: ${themeCssVariables.spacing[10]} ${themeCssVariables.spacing[6]};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  margin: 0 auto;
  max-width: ${GETTING_STARTED_CONTENT_MAX_WIDTH}px;
`;

const StyledHeading = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
  text-align: center;
`;

const StyledCountdown = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledDigits = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledDigit = styled.span`
  align-items: center;
  background: ${themeCssVariables.color.orange3};
  border: 1px solid ${themeCssVariables.color.amber6};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  color: ${themeCssVariables.color.amber11};
  display: flex;
  font-size: ${themeCssVariables.font.size.xxl};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  height: ${themeCssVariables.spacing[11]};
  isolation: isolate;
  justify-content: center;
  position: relative;
  width: calc(
    ${themeCssVariables.spacing[8]} + ${themeCssVariables.spacing['0.5']}
  );

  &::after {
    background: ${themeCssVariables.color.amber11};
    content: '';
    height: 1px;
    left: 0;
    opacity: 0.2;
    position: absolute;
    right: 0;
    top: 50%;
    z-index: -1;
  }
`;

const StyledGoal = styled.div`
  align-items: center;
  align-self: center;
  border: 1px dashed ${themeCssVariables.border.color.strong};
  border-radius: ${themeCssVariables.border.radius.md};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: calc(
    ${themeCssVariables.spacing[7]} + ${themeCssVariables.spacing['0.5']}
  );
  padding: 0 ${themeCssVariables.spacing[1]} 0 ${themeCssVariables.spacing[2]};
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: center;
`;

export const GettingStartedPageContent = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const currentUser = useAtomStateValue(currentUserState);
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);
  const { numberFormat } = useNumberFormat();
  const { timeZone } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const { progress, loading, error, refetch } = useGettingStartedProgress();
  const { updateGettingStarted, isSaving } = useUpdateGettingStarted();
  const { trialEnd, daysLeft, isCountdownVisible, canKeepPlan, keepPlanLabel } =
    useGettingStartedTrial();

  const completedSteps = progress?.completedSteps ?? [];
  const isComplete = GETTING_STARTED_STEPS.every((step) =>
    completedSteps.includes(step),
  );
  const { selectedStep, stepAfterSkip } = getGettingStartedStepSelection({
    completedSteps,
    savedSelectedStep: progress?.selectedStep,
    permissionFlagMap,
  });
  const isSelectedStepCompleted = completedSteps.includes(selectedStep);
  const creditsEarned = progress?.creditsEarned ?? 0;

  const creditsToEarn = isDefined(onboardingConfig)
    ? getGettingStartedCreditsToEarn({
        completedSteps,
        onboardingConfig,
        isWorkspaceCreator: currentUser?.isWorkspaceCreator === true,
      })
    : 0;
  const goalCredits = isComplete ? creditsEarned : creditsToEarn;
  const formattedGoalCredits = formatOnboardingCredits(
    goalCredits,
    numberFormat,
  );

  const formattedTrialEnd =
    isCountdownVisible && isDefined(trialEnd)
      ? formatDateISOStringToCustomUnicodeFormat({
          date: trialEnd.toISOString(),
          timeZone,
          dateFormat: 'EEE, MMM d',
          localeCatalog,
        })
      : undefined;
  const remainingStepCount =
    GETTING_STARTED_STEPS.length - completedSteps.length;
  const remainingStepsLabel = isDefined(formattedTrialEnd)
    ? creditsToEarn > 0
      ? plural(remainingStepCount, {
          one: `Finish # step by ${formattedTrialEnd} to earn`,
          other: `Finish # steps by ${formattedTrialEnd} to earn`,
        })
      : plural(remainingStepCount, {
          one: `Finish # step by ${formattedTrialEnd}`,
          other: `Finish # steps by ${formattedTrialEnd}`,
        })
    : creditsToEarn > 0
      ? plural(remainingStepCount, {
          one: 'Finish # step to earn',
          other: 'Finish # steps to earn',
        })
      : plural(remainingStepCount, {
          one: 'Finish # step',
          other: 'Finish # steps',
        });
  const completedLabel =
    creditsEarned > 0 ? t`All steps done, you earned` : t`All steps done`;
  const goalLabel = isComplete ? completedLabel : remainingStepsLabel;

  return (
    <StyledScroll>
      <StyledContent>
        <StyledHeading>
          <StyledCountdown>
            {isCountdownVisible && (
              <StyledDigits>
                {String(daysLeft)
                  .padStart(2, '0')
                  .split('')
                  .map((digit, index) => (
                    <StyledDigit key={index}>{digit}</StyledDigit>
                  ))}
              </StyledDigits>
            )}
            <StyledOnboardingStepTitle>
              {isCountdownVisible
                ? plural(daysLeft, {
                    one: 'day left in your trial',
                    other: 'days left in your trial',
                  })
                : t`Finish your setup`}
            </StyledOnboardingStepTitle>
          </StyledCountdown>
          {canKeepPlan && (
            <NavigationButton
              variant="outline"
              color="accent"
              startIcon={<IconCreditCard />}
              to={getSettingsPath(SettingsPath.Billing)}
            >
              {keepPlanLabel}
            </NavigationButton>
          )}
        </StyledHeading>
        {loading && !isDefined(progress) && (
          <Loader role="status" aria-label={t`Loading your progress`} />
        )}
        {isDefined(error) && !isDefined(progress) && (
          <Callout
            status="error"
            role="alert"
            title={t`Could not load Getting started.`}
            action={
              <Callout.Action onClick={() => void refetch()}>
                {t`Try again`}
              </Callout.Action>
            }
          />
        )}
        {isDefined(progress) && (
          <>
            <StyledGoal>
              {isComplete ? (
                <IconCheck
                  size={theme.icon.size.md}
                  color={theme.font.color.tertiary}
                />
              ) : (
                <IconListCheck
                  size={theme.icon.size.md}
                  color={theme.font.color.tertiary}
                />
              )}
              <span>{goalLabel}</span>
              {goalCredits > 0 && (
                <OnboardingCreditsRewardChip
                  formattedCreditsReward={plural(goalCredits, {
                    one: `${formattedGoalCredits} credit`,
                    other: `${formattedGoalCredits} credits`,
                  })}
                />
              )}
            </StyledGoal>
            <GettingStartedStepStack
              selectedStep={selectedStep}
              completedSteps={completedSteps}
              isSaving={isSaving}
              onSelectStep={(step) =>
                updateGettingStarted({ selectedStep: step })
              }
            />
            {!isComplete && (
              <StyledFooter>
                <Button
                  variant="ghost"
                  disabled={isSaving}
                  onClick={() =>
                    updateGettingStarted({ selectedStep: stepAfterSkip })
                  }
                >
                  {isSelectedStepCompleted ? t`Back to current step` : t`Skip`}
                </Button>
              </StyledFooter>
            )}
          </>
        )}
      </StyledContent>
    </StyledScroll>
  );
};
