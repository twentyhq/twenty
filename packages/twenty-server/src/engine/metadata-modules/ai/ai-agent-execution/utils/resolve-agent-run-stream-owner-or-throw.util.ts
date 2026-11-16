import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AgentRunStreamOwner } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-stream-owner.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

// an API key has neither, and its channels would be shared by every key of the workspace
export const resolveAgentRunStreamOwnerOrThrow = ({
  callerApplication,
  callerWorkspaceMemberId,
}: {
  callerApplication: Pick<FlatApplication, 'id'> | null | undefined;
  callerWorkspaceMemberId: string | null;
}): AgentRunStreamOwner => {
  if (isDefined(callerApplication)) {
    return {
      kind: 'application',
      applicationId: callerApplication.id,
      workspaceMemberId: callerWorkspaceMemberId,
    };
  }

  if (isDefined(callerWorkspaceMemberId)) {
    return {
      kind: 'workspaceMember',
      workspaceMemberId: callerWorkspaceMemberId,
    };
  }

  throw new AiException(
    'runId needs a workspace member session or an application access token',
    AiExceptionCode.INVALID_AGENT_INPUT,
  );
};
