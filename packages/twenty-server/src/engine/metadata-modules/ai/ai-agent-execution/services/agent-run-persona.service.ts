import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';

import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type AgentRunPersonaSpec } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/agent-run-spec.type';
import { type ResolvedAgentRunPersona } from 'src/engine/metadata-modules/ai/ai-agent-execution/types/resolved-agent-run-persona.type';
import { buildAgentRunAuthContext } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/build-agent-run-auth-context.util';
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
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { resolveAiRunPermissionScope } from 'src/engine/permissions/role/utils/resolve-ai-run-permission-scope.util';
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
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
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

  // What the run reads and acts with, for its tools as for the records that wake it up. Undefined when it may read nothing
  async resolveRunAuthContext({
    workspaceId,
    persona: {
      agentId,
      permissions: { scope, explicitObjectGrants },
    },
    authContext,
  }: {
    workspaceId: string;
    persona: Pick<ResolvedAgentRunPersona, 'agentId' | 'permissions'>;
    authContext: WorkspaceAuthContext | undefined;
  }): Promise<WorkspaceAuthContext | undefined> {
    if (!isDefined(authContext) || !isDefined(explicitObjectGrants)) {
      return undefined;
    }

    if (!isDefined(agentId) && !isDefined(scope)) {
      return authContext;
    }

    if (!isDefined(scope)) {
      return buildAgentRunAuthContext({
        authContext,
        agentId: agentId ?? undefined,
      });
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatObjectMetadataMaps', 'flatFieldMetadataMaps'],
        },
      );

    return buildAgentRunAuthContext({
      authContext,
      agentId: agentId ?? undefined,
      permissionScope: resolveAiRunPermissionScope({
        scope,
        flatObjectMetadataMaps,
        flatFieldMetadataMaps,
      }),
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
      explicitObjectGrants: isDefined(agentRole)
        ? buildRoleExplicitObjectGrants({
            role: agentRole,
            flatObjectPermissionMaps,
          })
        : { objectPermissions: [] },
    };
  }
}
