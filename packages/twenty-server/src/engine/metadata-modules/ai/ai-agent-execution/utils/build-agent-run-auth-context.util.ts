import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type PermissionScope } from 'src/engine/permissions/principal/types/permission-scope.type';

// A run never exceeds its agent, its scope nor the agent's application, whoever calls it
export const buildAgentRunAuthContext = ({
  authContext,
  agentId,
  application,
  permissionScope,
}: {
  authContext: WorkspaceAuthContext;
  agentId?: string;
  application?: FlatApplication;
  permissionScope?: PermissionScope;
}): WorkspaceAuthContext => {
  const narrowing = {
    ...(isDefined(agentId) ? { agentId } : {}),
    ...(isDefined(permissionScope) ? { permissionScope } : {}),
  };

  switch (authContext.type) {
    case 'user':
    case 'apiKey':
      return {
        ...authContext,
        ...narrowing,
        application: application ?? authContext.application,
      };
    case 'application':
      return { ...authContext, ...narrowing };
    default:
      throw new AiException(
        `An agent cannot run with a ${authContext.type} auth context`,
        AiExceptionCode.AGENT_EXECUTION_FAILED,
      );
  }
};
