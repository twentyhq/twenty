import { useEffect, useState } from 'react';
import { useMatch } from 'react-router-dom';

import { OnboardingActivationSteps } from '@/onboarding/components/OnboardingActivationSteps';
import { OnboardingActivationStepsEffect } from '@/onboarding/components/OnboardingActivationStepsEffect';
import { ONBOARDING_ACTIVATION_MESSAGES } from '@/onboarding/constants/OnboardingActivationMessages';
import { WORKSPACE_ACTIVATION_FIRST_MESSAGE_INDEX } from '@/onboarding/constants/WorkspaceActivationFirstMessageIndex';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const OnboardingActivationStepsProgress = () => {
  const isActivating = isDefined(useMatch(AppPath.WorkspaceActivation));

  const [messageIndex, setMessageIndex] = useState(
    isActivating ? WORKSPACE_ACTIVATION_FIRST_MESSAGE_INDEX : 0,
  );

  useEffect(() => {
    setMessageIndex(isActivating ? WORKSPACE_ACTIVATION_FIRST_MESSAGE_INDEX : 0);
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
        messages={ONBOARDING_ACTIVATION_MESSAGES}
        messageIndex={messageIndex}
      />
    </>
  );
};
