import { ConnectSlackAutoSkipEffect } from '@/onboarding/effect-components/ConnectSlackAutoSkipEffect';
import { useSkipConnectSlackOnboardingStep } from '@/onboarding/hooks/useSkipConnectSlackOnboardingStep';
import { useStartConnectSlackOnboardingStep } from '@/onboarding/hooks/useStartConnectSlackOnboardingStep';
import { useQuery } from '@apollo/client/react';
import { useCallback, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IsConnectSlackOnboardingStepAvailableDocument } from '~/generated-metadata/graphql';
import { ConnectSlackContent } from '~/pages/onboarding/ConnectSlackContent';

export const ConnectSlack = () => {
  const { data, loading, error } = useQuery(
    IsConnectSlackOnboardingStepAvailableDocument,
  );
  const { startConnectSlack, isStarting } =
    useStartConnectSlackOnboardingStep();
  const skipConnectSlackOnboardingStep = useSkipConnectSlackOnboardingStep();
  const [hasAutoSkipFailed, setHasAutoSkipFailed] = useState(false);

  const handleAutoSkipError = useCallback(() => {
    setHasAutoSkipFailed(true);
  }, []);

  if (loading) {
    return null;
  }

  const isAvailable =
    !isDefined(error) && data?.isConnectSlackOnboardingStepAvailable === true;

  if (!isAvailable && !hasAutoSkipFailed) {
    return <ConnectSlackAutoSkipEffect onError={handleAutoSkipError} />;
  }

  return (
    <ConnectSlackContent
      isConnecting={isStarting}
      onConnect={startConnectSlack}
      onSkip={() => skipConnectSlackOnboardingStep({ isAutoSkipped: false })}
    />
  );
};
