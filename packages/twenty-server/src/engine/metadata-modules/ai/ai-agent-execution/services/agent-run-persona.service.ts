import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type AgentRunPersonaSpec } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-spec.type';
import { type ResolvedAgentRunPersona } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-agent-run-persona.type';
import { buildRoleExplicitObjectGrants } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-role-explicit-object-grants.util';
import { resolveAgentRunPersonaFromAgent } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-agent-run-persona-from-agent.util';
import { resolveAgentRunPersonaFromInlineConfig } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-agent-run-persona-from-inline-config.util';
import { AiAgentRoleService } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.service';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { resolveEffectiveAgent } from 'src/engine/metadata-modules/flat-agent/utils/resolve-effective-agent.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class AgentRunPersonaService {
  constructor(
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
    private readonly aiAgentRoleService: AiAgentRoleService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
      const { label } = effectiveAgent;

      throw new AiException(
        `Agent "${label}" is archived`,
        AiExceptionCode.AGENT_IS_INACTIVE,
        { userFriendlyMessage: msg`Agent "${label}" is archived.` },
      );
    }

    return resolveAgentRunPersonaFromAgent({
      agent: effectiveAgent,
      ...(await this.resolveAgentRoleGrants({
        workspaceId,
        agentId: effectiveAgent.id,
      })),
    });
  }

  private async resolveAgentRoleGrants({
    workspaceId,
    agentId,
  }: {
    workspaceId: string;
    agentId: string;
  }): Promise<
    Pick<
      ResolvedAgentRunPersona['permissions'],
      'agentRoleId' | 'explicitObjectGrants'
    >
  > {
    const agentRoleId = await this.aiAgentRoleService.findAgentRoleId({
      workspaceId,
      agentId,
    });

    if (!isDefined(agentRoleId)) {
      return { agentRoleId: null, explicitObjectGrants: null };
    }

    const { flatObjectPermissionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectPermissionMaps',
      ]);

    return {
      agentRoleId,
      explicitObjectGrants: buildRoleExplicitObjectGrants({
        roleId: agentRoleId,
        flatObjectPermissionMaps,
      }),
    };
  }
}
