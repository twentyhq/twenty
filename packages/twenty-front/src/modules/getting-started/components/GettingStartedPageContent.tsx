import { GettingStartedStepStack } from '@/getting-started/components/GettingStartedStepStack';
import { GETTING_STARTED_CONTENT_MAX_WIDTH } from '@/getting-started/constants/GettingStartedContentMaxWidth';
import { useGettingStartedProgress } from '@/getting-started/hooks/useGettingStartedProgress';
import { useGettingStartedTrial } from '@/getting-started/hooks/useGettingStartedTrial';
import { gettingStartedJustCompletedStepState } from '@/getting-started/states/gettingStartedJustCompletedStepState';
import { getGettingStartedStepSelection } from '@/getting-started/utils/getGettingStartedStepSelection';
import { StyledOnboardingStepTitle } from '@/onboarding/components/StyledOnboardingStepTitle';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { Plural, useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { Callout } from 'twenty-ui/components/feedback';
import { Loader } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

import {
  GettingStartedWorkflowPreviewsDocument,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

const StyledPage = styled.div`
  container-name: getting-started-page;
  container-type: inline-size;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[20]} ${themeCssVariables.spacing[10]}
    ${themeCssVariables.spacing[12]};
`;

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[8]};
  margin: 0 auto;
  max-width: ${GETTING_STARTED_CONTENT_MAX_WIDTH}px;
  min-height: 0;
  width: 100%;
`;

const StyledHeading = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-bottom: ${themeCssVariables.spacing[12]};
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

export const GettingStartedPageContent = () => {
  const { t } = useLingui();
  const { progress, loading, error, refetch } = useGettingStartedProgress();
  const { daysLeft, isCountdownVisible } = useGettingStartedTrial();
  const gettingStartedJustCompletedStep = useAtomStateValue(
    gettingStartedJustCompletedStepState,
  );
  const hasWorkflowsPermission = useHasPermissionFlag(
    PermissionFlagType.WORKFLOWS,
  );

  useQuery(GettingStartedWorkflowPreviewsDocument, {
    skip: !hasWorkflowsPermission,
  });

  const stepDefinitions = progress?.steps ?? [];
  const stepActionKeys = stepDefinitions.map(({ actionKey }) => actionKey);
  const completedStepActionKeys = progress?.completedStepActionKeys ?? [];
  const { selectedStepActionKey } = getGettingStartedStepSelection({
    stepActionKeys,
    completedStepActionKeys,
    selectedStepActionKey:
      gettingStartedJustCompletedStep ?? progress?.selectedStepActionKey,
  });

  return (
    <StyledPage>
      <StyledContent>
        <StyledHeading>
          <StyledCountdown>
            {isCountdownVisible && (
              <StyledDigits role="img" aria-label={String(daysLeft)}>
                {String(daysLeft)
                  .padStart(2, '0')
                  .split('')
                  .map((digit, index) => (
                    <StyledDigit key={index}>{digit}</StyledDigit>
                  ))}
              </StyledDigits>
            )}
            <StyledOnboardingStepTitle>
              {isCountdownVisible ? (
                <Plural
                  value={daysLeft}
                  one="day left in your trial"
                  other="days left in your trial"
                />
              ) : (
                t`Finish your setup`
              )}
            </StyledOnboardingStepTitle>
          </StyledCountdown>
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
            {isNonEmptyArray(stepActionKeys) && (
              <GettingStartedStepStack
                steps={stepDefinitions}
                selectedStepActionKey={selectedStepActionKey}
                completedStepActionKeys={completedStepActionKeys}
              />
            )}
          </>
        )}
      </StyledContent>
    </StyledPage>
  );
};
