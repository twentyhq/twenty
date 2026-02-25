import { AgentChatDataLoading } from '@/ai/components/AgentChatDataLoading';
import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';

import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Suspense } from 'react';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const AgentChatProviderContent = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <AgentChatComponentInstanceContext.Provider
      value={{ instanceId: 'agentChatComponentInstance' }}
    >
      <AgentChatDataLoading />
      {children}
    </AgentChatComponentInstanceContext.Provider>
  );
};

export const AgentChatProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  if (!isAiEnabled) {
    return <>{children}</>;
  }

  return (
    <Suspense fallback={null}>
      <AgentChatProviderContent>{children}</AgentChatProviderContent>
    </Suspense>
  );
};
