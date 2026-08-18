import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { StartConnectSlackOnboardingStepDocument } from '~/generated-metadata/graphql';

// The onboarding step is not completed here: the server clears it when Slack
// redirects back with a connection, so a cancelled consent screen leaves the
// user on this step.
export const useStartConnectSlackOnboardingStep = () => {
  const [startConnectSlackOnboardingStepMutation] = useMutation(
    StartConnectSlackOnboardingStepDocument,
  );
  const { redirect } = useRedirect();
  const { enqueueErrorSnackBar } = useSnackBar();
  const [isStarting, setIsStarting] = useState(false);

  const startConnectSlack = async () => {
    if (isStarting) {
      return;
    }
    setIsStarting(true);

    try {
      const result = await startConnectSlackOnboardingStepMutation();
      const authorizationUrl =
        result.data?.startConnectSlackOnboardingStep.authorizationUrl;

      if (!isNonEmptyString(authorizationUrl)) {
        throw new Error('Slack authorization URL is missing');
      }

      redirect(authorizationUrl);
    } catch (error) {
      setIsStarting(false);

      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : t`Something went wrong while connecting Slack.`,
      });
    }
  };

  return { startConnectSlack, isStarting };
};
