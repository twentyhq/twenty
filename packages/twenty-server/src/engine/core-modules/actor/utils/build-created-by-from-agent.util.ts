import { type ActorMetadata, FieldActorSource } from 'twenty-shared/types';

import { type ActingAgent } from 'src/engine/core-modules/auth/types/acting-agent.type';

export const buildCreatedByFromAgent = ({
  agent,
  applicationId,
}: {
  agent: ActingAgent;
  applicationId: string;
}): ActorMetadata => ({
  source: FieldActorSource.AGENT,
  name: agent.label,
  workspaceMemberId: null,
  context: { agentId: agent.id, applicationId },
});
