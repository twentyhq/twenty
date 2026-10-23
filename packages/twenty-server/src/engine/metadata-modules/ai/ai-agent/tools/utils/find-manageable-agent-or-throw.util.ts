import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

export const findManageableAgentOrThrow = async ({
  agentId,
  agentService,
  context,
}: {
  agentId: string;
  agentService: AgentService;
  context: ToolProviderContext;
}): Promise<FlatAgentWithRoleId> => {
  const agent = await agentService.findOneAgentById({
    id: agentId,
    workspaceId: context.workspaceId,
  });

  if (
    !canCallerReachApplication({
      callingApplication: context.application,
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
