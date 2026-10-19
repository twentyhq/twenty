import { onboardingConfigState } from '@/client-config/states/onboardingConfigState';
import { GettingStartedStepStack } from '@/getting-started/components/GettingStartedStepStack';
import { GETTING_STARTED_CONTENT_MAX_WIDTH } from '@/getting-started/constants/GettingStartedContentMaxWidth';
import { GETTING_STARTED_STEPS } from '@/getting-started/constants/GettingStartedSteps';
import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { useGettingStartedTrial } from '@/getting-started/hooks/useGettingStartedTrial';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { getGettingStartedStepSelection } from '@/getting-started/utils/getGettingStartedStepSelection';
import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { formatDateISOStringToDate } from '@/localization/utils/formatDateISOStringToDate';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { formatOnboardingCredits } from '@/onboarding/utils/formatOnboardingCredits';
import { permissionFlagMapSelector } from '@/settings/roles/states/permissionFlagMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { Trans, useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Callout } from 'twenty-ui/components/feedback';
import { IconCheck, IconCoins } from 'twenty-ui/icon';
import { Badge } from 'twenty-ui/primitives/data-display';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledScroll = styled.div`
  flex: 1;
  overflow: auto;
  padding: ${themeCssVariables.spacing[12]} ${themeCssVariables.spacing[6]};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  margin: 0 auto;
  max-width: ${GETTING_STARTED_CONTENT_MAX_WIDTH}px;
`;

const StyledDigits = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledDigit = styled.span`
  background: ${themeCssVariables.color.amber3};
  border: 1px solid ${themeCssVariables.color.amber6};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.color.amber11};
  font-size: ${themeCssVariables.font.size.xxl};
  line-height: ${themeCssVariables.spacing[10]};
  text-align: center;
  width: ${themeCssVariables.spacing[8]};
`;

const StyledGoal = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[6]};
`;

const StyledMuted = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: center;
  margin-top: ${themeCssVariables.spacing[1]};
`;

export const GettingStartedPageContent = () => {
  const { t } = useLingui();
  const onboardingConfig = useAtomStateValue(onboardingConfigState);
  const permissionFlagMap = useAtomStateValue(permissionFlagMapSelector);
  const { numberFormat } = useNumberFormat();
  const { timeZone, dateFormat } = useDateTimeFormat();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);
  const { progress, loading, error, refetch } = useGettingStartedProgress();
  const { updateGettingStarted, isSaving } = useUpdateGettingStarted();
  const { trialEnd, daysLeft, isCountdownVisible } = useGettingStartedTrial();

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
  const goalLabel = isComplete ? t`All steps done` : t`Finish your setup`;
  const creditsEarned = progress?.creditsEarned ?? 0;

  const formattedTrialEnd = isDefined(trialEnd)
    ? formatDateISOStringToDate({
        date: trialEnd.toISOString(),
        timeZone,
        dateFormat,
        localeCatalog,
      })
    : undefined;
  const formattedCreditsEarned = formatOnboardingCredits(
    creditsEarned,
    numberFormat,
  );

  return (
    <StyledScroll>
      <StyledContent>
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
            : goalLabel}
        </StyledOnboardingStepTitle>
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
              <Badge size="md">
                {isComplete ? (
                  <IconCheck aria-hidden />
                ) : (
                  `${completedSteps.length}/${GETTING_STARTED_STEPS.length}`
                )}
              </Badge>
              {isCountdownVisible && isComplete && <span>{goalLabel}</span>}
              {isCountdownVisible && !isComplete && (
                <span>
                  <Trans>
                    Finish your setup{' '}
                    <StyledMuted>before {formattedTrialEnd}</StyledMuted>
                  </Trans>
                </span>
              )}
              {isDefined(onboardingConfig) && (
                <Badge size="md">
                  <IconCoins aria-hidden />
                  {plural(creditsEarned, {
                    one: `${formattedCreditsEarned} credit earned`,
                    other: `${formattedCreditsEarned} credits earned`,
                  })}
                </Badge>
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
                  size="sm"
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
