import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { GettingStartedAutoAdvanceEffect } from '@/getting-started/components/GettingStartedAutoAdvanceEffect';
import { GettingStartedKeepPlanButton } from '@/getting-started/components/GettingStartedKeepPlanButton';
import { GettingStartedRollingText } from '@/getting-started/components/GettingStartedRollingText';
import { GettingStartedStepStack } from '@/getting-started/components/GettingStartedStepStack';
import { GETTING_STARTED_CONTENT_MAX_WIDTH } from '@/getting-started/constants/GettingStartedContentMaxWidth';
import { GETTING_STARTED_IMPORT_CONTEXT_STORE_INSTANCE_ID } from '@/getting-started/constants/GettingStartedImportContextStoreInstanceId';
import { useGettingStartedJustCompletedStep } from '@/getting-started/hooks/useGettingStartedJustCompletedStep';
import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { useGettingStartedTrial } from '@/getting-started/hooks/useGettingStartedTrial';
import { useUpdateGettingStarted } from '@/getting-started/hooks/useUpdateGettingStarted';
import { getGettingStartedStepSelection } from '@/getting-started/utils/getGettingStartedStepSelection';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SpreadsheetImportProvider } from '@/spreadsheet-import/provider/components/SpreadsheetImportProvider';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Callout } from 'twenty-ui/components/feedback';
import { IconCheck, IconListCheck } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import {
  type GettingStartedStep,
  GettingStartedWorkflowPreviewsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

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
  const { progress, loading, error, refetch } = useGettingStartedProgress();
  const { updateGettingStarted, isSaving } = useUpdateGettingStarted();
  const { formattedTrialEnd, daysLeft, isCountdownVisible, canKeepPlan } =
    useGettingStartedTrial();
  const { justCompletedStep, clearJustCompletedStep } =
    useGettingStartedJustCompletedStep({ progress });
  const hasWorkflowsPermission = useHasPermissionFlag(
    PermissionFlagType.WORKFLOWS,
  );

  useQuery(GettingStartedWorkflowPreviewsDocument, {
    skip: !hasWorkflowsPermission,
  });

  const stepDefinitions = progress?.steps ?? [];
  const steps = stepDefinitions.map(({ step }) => step);
  const completedSteps = progress?.completedSteps ?? [];
  const remainingSteps = steps.filter((step) => !completedSteps.includes(step));
  const isComplete = remainingSteps.length === 0;
  const { selectedStep, nextStep, stepAfterSkip } =
    getGettingStartedStepSelection({
      steps,
      completedSteps,
      selectedStep: justCompletedStep ?? progress?.selectedStep,
    });
  const isSelectedStepCompleted = completedSteps.includes(selectedStep);

  const remainingStepCount = remainingSteps.length;
  const remainingStepsLabel = isDefined(formattedTrialEnd)
    ? plural(remainingStepCount, {
        one: `Finish # step by ${formattedTrialEnd}`,
        other: `Finish # steps by ${formattedTrialEnd}`,
      })
    : plural(remainingStepCount, {
        one: 'Finish # step',
        other: 'Finish # steps',
      });
  const goalLabel = isComplete ? t`All steps done` : remainingStepsLabel;

  const selectStep = (step: GettingStartedStep) => {
    clearJustCompletedStep();
    void updateGettingStarted({ selectedStep: step });
  };

  return (
    <StyledScroll>
      {isDefined(justCompletedStep) && (
        <GettingStartedAutoAdvanceEffect
          completedStep={justCompletedStep}
          onAdvance={() => selectStep(nextStep)}
        />
      )}
      {/* Mounted at page level so the import wizard survives the step advancing */}
      <ContextStoreComponentInstanceContext.Provider
        value={{ instanceId: GETTING_STARTED_IMPORT_CONTEXT_STORE_INSTANCE_ID }}
      >
        <SpreadsheetImportProvider />
      </ContextStoreComponentInstanceContext.Provider>
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
          {canKeepPlan && <GettingStartedKeepPlanButton color="accent" />}
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
              <GettingStartedRollingText text={goalLabel} />
            </StyledGoal>
            {isNonEmptyArray(steps) && (
              <GettingStartedStepStack
                steps={stepDefinitions}
                selectedStep={selectedStep}
                completedSteps={completedSteps}
                justCompletedStep={justCompletedStep}
                isSaving={isSaving}
                onSelectStep={selectStep}
              />
            )}
            {!isComplete && (
              <StyledFooter>
                <Button
                  variant="ghost"
                  disabled={isSaving}
                  onClick={() => selectStep(stepAfterSkip)}
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
