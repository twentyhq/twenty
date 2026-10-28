import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import { isAgentBackingWorkflowStep } from 'src/engine/metadata-modules/ai/ai-agent/tools/utils/is-agent-backing-workflow-step.util';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ManageableAgentService {
  constructor(
    private readonly agentService: AgentService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async findManageableAgentOrThrow({
    agentId,
    context,
  }: {
    agentId: string;
    context: ToolProviderContext;
  }): Promise<FlatAgentWithRoleId> {
    const agent = await this.agentService.findOneAgentById({
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
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId: context.workspaceId },
      );

    if (agent.applicationId !== workspaceCustomFlatApplication.id) {
      throw new AiException(
        'This agent is defined by an installed application: change it in that application',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    const { flatWorkflowVersionMaps } =
      await this.workspaceCacheService.getOrRecompute(context.workspaceId, [
        'flatWorkflowVersionMaps',
      ]);

    if (
      isAgentBackingWorkflowStep({
        agentId: agent.id,
        flatWorkflowVersions: Object.values(
          flatWorkflowVersionMaps.byUniversalIdentifier,
        ).filter(isDefined),
      })
    ) {
      throw new AiException(
        'This agent is managed by a workflow AI step: configure it with update_workflow_agent, and remove the step to delete it',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    return agent;
  }
}
