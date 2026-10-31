import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { type AgentRunPersonaSpec } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-spec.type';
import { type ResolvedAgentRunPersona } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-agent-run-persona.type';
import { resolveAgentRunPersonaFromAgent } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-agent-run-persona-from-agent.util';
import { resolveAgentRunPersonaFromInlineConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-agent-run-persona-from-inline-config.util';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { resolveEffectiveAgent } from 'src/engine/metadata-modules/flat-agent/utils/resolve-effective-agent.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';

@Injectable()
export class AgentRunPersonaService {
  constructor(
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
  ) {}

  async resolveOrThrow({
    workspaceId,
    spec,
  }: {
    workspaceId: string;
    spec: AgentRunPersonaSpec;
  }): Promise<ResolvedAgentRunPersona> {
    if (spec.agentId === null) {
      return resolveAgentRunPersonaFromInlineConfig(spec.inlineConfig);
    }

    const agent = await this.agentRepository.findOne(workspaceId, {
      where: { id: spec.agentId },
    });

    if (!isDefined(agent)) {
      throw new AiException(
        `Agent with id ${spec.agentId} not found`,
        AiExceptionCode.AGENT_NOT_FOUND,
      );
    }

    const effectiveAgent = resolveEffectiveAgent(agent);

    if (!effectiveAgent.isActive) {
      throw new AiException(
        `Agent "${effectiveAgent.label}" is archived`,
        AiExceptionCode.AGENT_IS_INACTIVE,
      );
    }

    return resolveAgentRunPersonaFromAgent(effectiveAgent);
  }
}
