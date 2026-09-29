import { isDefined } from 'twenty-shared/utils';

import { AiChatThreadRecordTargetsContent } from '@/ai/components/AiChatThreadRecordTargetsContent';
import { useAgentChatThreadJunctionConfig } from '@/ai/hooks/useAgentChatThreadJunctionConfig';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

type AiChatThreadRecordTargetsProps = {
  threadId: string;
  instanceId: string;
};

export const AiChatThreadRecordTargets = ({
  threadId,
  instanceId,
}: AiChatThreadRecordTargetsProps) => {
  const isConversationsTabEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CONVERSATIONS_TAB_ENABLED,
  );
  const junctionConfig = useAgentChatThreadJunctionConfig();

  if (!isConversationsTabEnabled || !isDefined(junctionConfig)) {
    return null;
  }

  return (
    <AiChatThreadRecordTargetsContent
      threadId={threadId}
      instanceId={instanceId}
      junctionConfig={junctionConfig}
    />
  );
};
