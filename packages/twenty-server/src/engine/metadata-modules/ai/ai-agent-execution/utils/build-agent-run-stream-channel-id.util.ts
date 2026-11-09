import { v5 } from 'uuid';

import { AGENT_RUN_STREAM_CHANNEL_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-stream-channel-id-namespace.const';
import { type AgentRunStreamOwner } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-stream-owner.type';

// a token without a member can never stand for one, so its channels are named apart from every member's
const APPLICATION_ONLY_CALLER = 'application';

// never a UUID, so a member's own runs stay apart from every application's, the custom one included
const WORKSPACE_MEMBER_OWNER_PREFIX = 'workspaceMember';

const serializeOwner = (owner: AgentRunStreamOwner): string => {
  switch (owner.kind) {
    case 'application':
      return `${owner.applicationId}:${owner.workspaceMemberId ?? APPLICATION_ONLY_CALLER}`;
    case 'workspaceMember':
      return `${WORKSPACE_MEMBER_OWNER_PREFIX}:${owner.workspaceMemberId}`;
  }
};

export const buildAgentRunStreamChannelId = ({
  owner,
  runId,
}: {
  owner: AgentRunStreamOwner;
  runId: string;
}): string =>
  v5(
    `${serializeOwner(owner)}:${runId}`,
    AGENT_RUN_STREAM_CHANNEL_ID_NAMESPACE,
  );
