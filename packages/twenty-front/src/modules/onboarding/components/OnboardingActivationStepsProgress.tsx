import { useEffect, useState } from 'react';
import { useMatch } from 'react-router-dom';

import { isCreatingWorkspaceState } from '@/auth/states/isCreatingWorkspaceState';
import { OnboardingActivationSteps } from '@/onboarding/components/OnboardingActivationSteps';
import { OnboardingActivationStepsEffect } from '@/onboarding/components/OnboardingActivationStepsEffect';
import { ONBOARDING_ACTIVATION_MESSAGES } from '@/onboarding/constants/OnboardingActivationMessages';
import { WORKSPACE_ACTIVATION_FIRST_MESSAGE_INDEX } from '@/onboarding/constants/WorkspaceActivationFirstMessageIndex';
import { useOnboardingStatus } from '@/onboarding/hooks/useOnboardingStatus';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { OnboardingStatus } from '~/generated-metadata/graphql';

export const OnboardingActivationStepsProgress = () => {
  const isActivating = isDefined(useMatch(AppPath.WorkspaceActivation));
  const isCreatingWorkspace = useAtomStateValue(isCreatingWorkspaceState);
  const onboardingStatus = useOnboardingStatus();

  const shouldShowWorkspaceActivationMessages =
    isActivating ||
    isCreatingWorkspace ||
    onboardingStatus === OnboardingStatus.WORKSPACE_ACTIVATION;

  const messages = shouldShowWorkspaceActivationMessages
    ? ONBOARDING_ACTIVATION_MESSAGES
    : ONBOARDING_ACTIVATION_MESSAGES.slice(
        0,
        WORKSPACE_ACTIVATION_FIRST_MESSAGE_INDEX,
      );

  const [messageIndex, setMessageIndex] = useState(
    isActivating ? WORKSPACE_ACTIVATION_FIRST_MESSAGE_INDEX : 0,
  );

  useEffect(() => {
    setMessageIndex(
      isActivating ? WORKSPACE_ACTIVATION_FIRST_MESSAGE_INDEX : 0,
    );
  }, [isActivating]);

  return (
    <>
      {isActivating && (
        <OnboardingActivationStepsEffect
          messageIndex={messageIndex}
          setMessageIndex={setMessageIndex}
          messageCount={ONBOARDING_ACTIVATION_MESSAGES.length}
        />
      )}
      <OnboardingActivationSteps
        messages={messages}
        messageIndex={messageIndex}
      />
    </>
  );
};
