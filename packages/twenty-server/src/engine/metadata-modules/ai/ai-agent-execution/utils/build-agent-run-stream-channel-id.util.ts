import { v5 } from 'uuid';

import { AGENT_RUN_STREAM_CHANNEL_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-stream-channel-id-namespace.const';

// a token without a member can never stand for one, so its channels are named apart from every member's
const APPLICATION_ONLY_CALLER = 'application';

// keyed by the caller as well as the application, so a member-bound token can only name its own member's runs
export const buildAgentRunStreamChannelId = ({
  applicationId,
  callerWorkspaceMemberId,
  runId,
}: {
  applicationId: string;
  callerWorkspaceMemberId: string | null;
  runId: string;
}): string =>
  v5(
    `${applicationId}:${callerWorkspaceMemberId ?? APPLICATION_ONLY_CALLER}:${runId}`,
    AGENT_RUN_STREAM_CHANNEL_ID_NAMESPACE,
  );
