import { isDefined } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { type ApplicationService } from 'src/engine/core-modules/application/application.service';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

export const findManageableAgentOrThrow = async ({
  agentId,
  agentService,
  applicationService,
  workspaceCacheService,
  context,
}: {
  agentId: string;
  agentService: AgentService;
  applicationService: ApplicationService;
  workspaceCacheService: WorkspaceCacheService;
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

  const { workspaceCustomFlatApplication } =
    await applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
      { workspaceId: context.workspaceId },
    );

  if (agent.applicationId !== workspaceCustomFlatApplication.id) {
    throw new AiException(
      'This agent is defined by an installed application: change it in that application',
      AiExceptionCode.INVALID_AGENT_INPUT,
    );
  }

  const { flatWorkflowVersionMaps } =
    await workspaceCacheService.getOrRecompute(context.workspaceId, [
      'flatWorkflowVersionMaps',
    ]);

  const isBackingWorkflowStep = Object.values(
    flatWorkflowVersionMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .some((flatWorkflowVersion) =>
      (flatWorkflowVersion.steps ?? []).some(
        (step) =>
          step.type === WorkflowActionType.AI_AGENT &&
          step.settings?.input?.agentId === agent.id,
      ),
    );

  if (isBackingWorkflowStep) {
    throw new AiException(
      'This agent is managed by a workflow AI step: configure it with update_workflow_agent, and remove the step to delete it',
      AiExceptionCode.INVALID_AGENT_INPUT,
    );
  }

  return agent;
};
