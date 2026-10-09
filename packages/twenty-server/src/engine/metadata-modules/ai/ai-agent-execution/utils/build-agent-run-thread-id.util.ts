import { v5 } from 'uuid';

import { AGENT_RUN_THREAD_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-thread-id-namespace.const';
import { buildConversationKey } from 'src/engine/metadata-modules/ai/ai-chat/utils/build-conversation-key.util';

export const buildAgentRunThreadId = ({
  appSecret,
  workspaceId,
  applicationId,
  agentId,
  threadKey,
}: {
  appSecret: string;
  workspaceId: string;
  applicationId: string;
  agentId: string;
  threadKey: string;
}): string =>
  v5(
    buildConversationKey({
      appSecret,
      workspaceId,
      senderKey: `${applicationId}:${agentId}`,
      threadKey,
    }),
    AGENT_RUN_THREAD_ID_NAMESPACE,
  );
