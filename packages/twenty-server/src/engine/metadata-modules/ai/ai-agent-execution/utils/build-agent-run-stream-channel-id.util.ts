import { v5 } from 'uuid';

import { AGENT_RUN_STREAM_CHANNEL_ID_NAMESPACE } from 'src/engine/metadata-modules/ai/ai-agent-execution/constants/agent-run-stream-channel-id-namespace.const';
import { type AgentRunStreamOwner } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-stream-owner.type';

// a token without a member can never stand for one, so its channels are named apart from every member's
const APPLICATION_ONLY_CALLER = 'application';

// application ids are UUIDs, so this prefix keeps a member's own runs apart from every application's,
// including the workspace custom application whose tokens logic functions hold on a member's behalf
const WORKSPACE_MEMBER_OWNER_PREFIX = 'workspaceMember';

const serializeOwner = (owner: AgentRunStreamOwner): string => {
  switch (owner.kind) {
    case 'application':
      return `${owner.applicationId}:${owner.workspaceMemberId ?? APPLICATION_ONLY_CALLER}`;
    case 'workspaceMember':
      return `${WORKSPACE_MEMBER_OWNER_PREFIX}:${owner.workspaceMemberId}`;
  }
};

// keyed by the whole owner, so a caller can only name the channels of its own runs
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
