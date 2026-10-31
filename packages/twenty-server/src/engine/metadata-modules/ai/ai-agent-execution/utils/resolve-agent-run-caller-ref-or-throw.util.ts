import { isDefined } from 'twenty-shared/utils';

import { type FlatApiKey } from 'src/engine/core-modules/api-key/types/flat-api-key.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AgentRunCallerRef } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-caller-ref.schema';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export const resolveAgentRunCallerRefOrThrow = ({
  callerApplication,
  callerApiKey,
  requestUserWorkspaceId,
  requestWorkspaceMemberId,
}: {
  callerApplication?: FlatApplication;
  callerApiKey?: Pick<FlatApiKey, 'id'>;
  requestUserWorkspaceId: string | null;
  requestWorkspaceMemberId: string | null;
}): AgentRunCallerRef => {
  if (isDefined(requestWorkspaceMemberId)) {
    return { callerWorkspaceMemberId: requestWorkspaceMemberId };
  }

  if (isDefined(callerApplication) && !isDefined(requestUserWorkspaceId)) {
    return {};
  }

  if (isDefined(callerApiKey)) {
    return { callerApiKeyId: callerApiKey.id };
  }

  throw new AiException(
    'An AI run requires a workspace member, an API key or an application',
    AiExceptionCode.RUN_AGENT_NOT_ALLOWED,
  );
};
