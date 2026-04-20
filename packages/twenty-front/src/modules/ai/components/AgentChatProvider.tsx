import { AgentChatProviderContent } from '@/ai/components/AgentChatProviderContent';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const AgentChatProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const isAiEnabled = useIsFeatureEnabled(FeatureFlagKey.IS_AI_ENABLED);

  return (
    <AgentChatProviderContent isAiEnabled={isAiEnabled}>
      {children}
    </AgentChatProviderContent>
  );
};
