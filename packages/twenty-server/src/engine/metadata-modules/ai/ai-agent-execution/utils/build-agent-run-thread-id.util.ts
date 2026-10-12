import { v5 } from 'uuid';

import { AGENT_RUN_THREAD_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-thread-id-namespace.const';

export const buildAgentRunThreadId = ({
  applicationId,
  agentId,
  threadKey,
}: {
  applicationId: string;
  agentId: string;
  threadKey: string;
}): string =>
  v5(`${applicationId}:${agentId}:${threadKey}`, AGENT_RUN_THREAD_ID_NAMESPACE);
