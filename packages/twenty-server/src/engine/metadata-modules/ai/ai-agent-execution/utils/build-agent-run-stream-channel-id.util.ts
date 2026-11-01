import { v5 } from 'uuid';

import { AGENT_RUN_STREAM_CHANNEL_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-stream-channel-id-namespace.const';

// keyed by the application like buildAgentRunThreadId, so an app can only ever name the channel of its own runs
export const buildAgentRunStreamChannelId = ({
  applicationId,
  runId,
}: {
  applicationId: string;
  runId: string;
}): string =>
  v5(`${applicationId}:${runId}`, AGENT_RUN_STREAM_CHANNEL_ID_NAMESPACE);
