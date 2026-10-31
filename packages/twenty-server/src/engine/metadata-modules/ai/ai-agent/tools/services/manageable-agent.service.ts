import { Injectable } from '@nestjs/common';

import { isWorkflowStepOwnedAgent } from 'twenty-shared/workflow';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { AgentService } from 'src/engine/metadata-modules/ai/ai-agent/agent.service';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { type FlatAgentWithRoleId } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

@Injectable()
export class ManageableAgentService {
  constructor(
    private readonly agentService: AgentService,
    private readonly applicationService: ApplicationService,
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
        operation: 'manage',
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

    if (isWorkflowStepOwnedAgent(agent)) {
      throw new AiException(
        'This agent is managed by a workflow AI step: configure it with update_workflow_agent, and remove the step to delete it',
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }

    return agent;
  }
}
