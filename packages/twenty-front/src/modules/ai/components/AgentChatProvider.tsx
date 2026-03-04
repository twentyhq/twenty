import { AgentChatDataEffect } from '@/ai/components/AgentChatDataEffect';
import { AgentChatComponentInstanceContext } from '@/ai/states/AgentChatComponentInstanceContext';

import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { Suspense } from 'react';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

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
      <AgentChatComponentInstanceContext.Provider
        value={{ instanceId: 'agentChatComponentInstance' }}
      >
        <AgentChatDataEffect />
        {children}
      </AgentChatComponentInstanceContext.Provider>
    </Suspense>
  );
};
