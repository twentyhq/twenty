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
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
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
      await this.assertApplicationExistsOrThrow({
        workspaceId,
        applicationId: spec.inlineConfig.applicationId,
      });

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

  // like a deleted agent, a deleted application fails the run rather than letting it act for the workspace
  private async assertApplicationExistsOrThrow({
    workspaceId,
    applicationId,
  }: {
    workspaceId: string;
    applicationId: string;
  }): Promise<void> {
    const { flatApplicationMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatApplicationMaps',
      ]);

    const application = flatApplicationMaps.byId[applicationId];

    if (!isDefined(application) || isDefined(application.deletedAt)) {
      throw new AiException(
        `Application with id ${applicationId} not found`,
        AiExceptionCode.INVALID_AGENT_INPUT,
      );
    }
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

    const { flatObjectPermissionMaps, flatRoleMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectPermissionMaps',
        'flatRoleMaps',
      ]);
    const agentRole = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: agentRoleId,
      flatEntityMaps: flatRoleMaps,
    });

    return {
      agentRoleId,
      // a role missing from the cache grants nothing, so its run gets no tools
      explicitObjectGrants: isDefined(agentRole)
        ? buildRoleExplicitObjectGrants({
            role: agentRole,
            flatObjectPermissionMaps,
          })
        : { objectPermissions: [] },
    };
  }
}
