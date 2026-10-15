import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type AgentToolContext } from 'src/engine/metadata-modules/ai/ai-agent/tools/types/agent-tool-context.type';
import { type AgentToolDependencies } from 'src/engine/metadata-modules/ai/ai-agent/tools/types/agent-tool-dependencies.type';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

export const findManageableAgentOrThrow = async ({
  agentId,
  deps,
  context,
}: {
  agentId: string;
  deps: Pick<AgentToolDependencies, 'agentService'>;
  context: AgentToolContext;
}): Promise<FlatAgentWithRoleId> => {
  const agent = await deps.agentService.findOneAgentById({
    id: agentId,
    workspaceId: context.workspaceId,
  });

  if (
    !canCallerReachApplication({
      callingApplication: context.callingApplication,
      applicationId: agent.applicationId,
    })
  ) {
    throw new AiException('Agent not found', AiExceptionCode.AGENT_NOT_FOUND);
  }

  if (agent.isSystem) {
    throw new AiException(
      'This agent is managed by a workflow AI step or an installed application: configure a workflow step agent with update_workflow_agent, and remove the step to delete it',
      AiExceptionCode.INVALID_AGENT_INPUT,
    );
  }

  return agent;
};
