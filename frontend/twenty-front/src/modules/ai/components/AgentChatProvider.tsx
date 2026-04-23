import { AgentChatProviderContent } from '@/ai/components/AgentChatProviderContent';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
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

  return <AgentChatProviderContent>{children}</AgentChatProviderContent>;
};
