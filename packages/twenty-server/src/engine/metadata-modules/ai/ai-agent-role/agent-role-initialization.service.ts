import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IsNull } from 'typeorm';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { getAgentRoleLabel } from 'src/engine/metadata-modules/ai/ai-agent-role/utils/get-agent-role-label.util';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { transformAgentEntityToFlatAgent } from 'src/engine/metadata-modules/flat-agent/utils/transform-agent-entity-to-flat-agent.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { fromCreateRoleInputToFlatRoleToCreate } from 'src/engine/metadata-modules/flat-role/utils/from-create-role-input-to-flat-role-to-create.util';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { fromCreateRoleTargetInputToFlatRoleTargetToCreate } from 'src/engine/metadata-modules/role-target/utils/from-create-role-target-input-to-flat-role-target-to-create.util';
import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { fromRoleEntityToRoleDto } from 'src/engine/metadata-modules/role/utils/fromRoleEntityToRoleDto.util';
import {
  PermissionsException,
  PermissionsExceptionCode,
} from 'src/engine/permissions/permissions.exception';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const AGENT_ROLE_INITIALIZATION_LOCK_PREFIX = 'agent-role-initialization';
const AGENT_ROLE_INITIALIZATION_LOCK_OPTIONS = { maxRetries: 300 };

type AgentRoleInitializationParameters = {
  agentId: string;
  workspaceId: string;
};

type AgentRoleInitializationContext = AgentRoleInitializationParameters & {
  workspaceCustomFlatApplication: FlatApplication;
};

@Injectable()
export class AgentRoleInitializationService {
  constructor(
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
    @InjectWorkspaceScopedRepository(RoleEntity)
    private readonly roleRepository: WorkspaceScopedRepository<RoleEntity>,
    @InjectWorkspaceScopedRepository(RoleTargetEntity)
    private readonly roleTargetRepository: WorkspaceScopedRepository<RoleTargetEntity>,
    private readonly applicationService: ApplicationService,
    private readonly cacheLockService: CacheLockService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {}

  async ensureAgentRoleOrThrow(
    parameters: AgentRoleInitializationParameters,
  ): Promise<RoleDTO> {
    return this.cacheLockService.withLock(
      () => this.initializeAgentRoleOrThrow(parameters),
      `${AGENT_ROLE_INITIALIZATION_LOCK_PREFIX}:${parameters.workspaceId}`,
      AGENT_ROLE_INITIALIZATION_LOCK_OPTIONS,
    );
  }

  private async initializeAgentRoleOrThrow({
    agentId,
    workspaceId,
  }: AgentRoleInitializationParameters): Promise<RoleDTO> {
    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );
    const agent = await this.agentRepository.findOne(workspaceId, {
      where: { id: agentId, deletedAt: IsNull() },
    });

    if (!isDefined(agent)) {
      throw new AiException('Agent not found', AiExceptionCode.AGENT_NOT_FOUND);
    }

    const isEditableAgent =
      agent.applicationId === workspaceCustomFlatApplication.id &&
      !agent.isSystem;

    if (!isEditableAgent) {
      throw new PermissionsException(
        'Cannot initialize permissions for an application-managed agent',
        PermissionsExceptionCode.PERMISSION_DENIED,
        {
          userFriendlyMessage: msg`This agent comes from an application, so its permissions cannot be changed here.`,
        },
      );
    }

    const context = { agentId, workspaceId, workspaceCustomFlatApplication };
    const existingRole = await this.findAssignedRoleOrThrow(context);
    const role =
      existingRole ??
      (await this.createAndAssignRoleOrThrow({
        ...context,
        agent,
      }));

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatRoleMaps',
      'flatRoleTargetMaps',
    ]);

    return fromRoleEntityToRoleDto(role);
  }

  private async findAssignedRoleOrThrow({
    agentId,
    workspaceId,
    workspaceCustomFlatApplication,
  }: AgentRoleInitializationContext): Promise<RoleEntity | undefined> {
    const target = await this.roleTargetRepository.findOne(workspaceId, {
      where: { agentId },
      relations: {
        role: {
          roleTargets: true,
          objectPermissions: true,
          fieldPermissions: true,
          rolePermissionFlags: { permissionFlag: true },
        },
      },
    });

    if (!isDefined(target)) {
      return undefined;
    }

    const { role } = target;
    const isExclusiveToAgent =
      role.roleTargets.length === 1 &&
      role.roleTargets.every(
        ({ agentId: assignedAgentId }) => assignedAgentId === agentId,
      );
    const isEditableRole =
      role.applicationId === workspaceCustomFlatApplication.id &&
      role.isEditable &&
      role.canBeAssignedToAgents &&
      !role.canBeAssignedToUsers &&
      !role.canBeAssignedToApiKeys &&
      isExclusiveToAgent;

    if (!isEditableRole) {
      throw new PermissionsException(
        'The agent role is shared or managed by an application',
        PermissionsExceptionCode.ROLE_NOT_EDITABLE,
        {
          userFriendlyMessage: msg`This agent shares its role or uses an application-managed role. Change its permissions in Settings > Roles.`,
        },
      );
    }

    return role;
  }

  private async createAndAssignRoleOrThrow({
    agent,
    ...context
  }: AgentRoleInitializationContext & {
    agent: AgentEntity;
  }): Promise<RoleEntity> {
    const { workspaceId, workspaceCustomFlatApplication } = context;
    const roles = await this.roleRepository.find(workspaceId, {
      select: { label: true },
    });
    const flatRoleToCreate = fromCreateRoleInputToFlatRoleToCreate({
      createRoleInput: {
        label: getAgentRoleLabel({
          agentLabel: agent.label,
          roleLabels: roles.map(({ label }) => label),
        }),
        icon: 'IconLock',
        canUpdateAllSettings: false,
        canAccessAllTools: false,
        canAccessAllAgentChatChannels: false,
        canReadAllObjectRecords: false,
        canUpdateAllObjectRecords: false,
        canSoftDeleteAllObjectRecords: false,
        canDestroyAllObjectRecords: false,
        canBeAssignedToUsers: false,
        canBeAssignedToAgents: true,
        canBeAssignedToApiKeys: false,
      },
      workspaceId,
      flatApplication: workspaceCustomFlatApplication,
    });
    const flatAgent = transformAgentEntityToFlatAgent({
      entity: agent,
      applicationIdToUniversalIdentifierMap: new Map([
        [
          workspaceCustomFlatApplication.id,
          workspaceCustomFlatApplication.universalIdentifier,
        ],
      ]),
    });
    const { flatRoleTargetToCreate } =
      fromCreateRoleTargetInputToFlatRoleTargetToCreate({
        createRoleTargetInput: {
          roleId: flatRoleToCreate.id,
          targetId: agent.id,
          targetMetadataForeignKey: 'agentId',
        },
        workspaceId,
        flatApplication: workspaceCustomFlatApplication,
        flatRoleMaps: addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: flatRoleToCreate,
          flatEntityMaps: createEmptyFlatEntityMaps(),
        }),
        flatAgentMaps: addFlatEntityToFlatEntityMapsOrThrow({
          flatEntity: flatAgent,
          flatEntityMaps: createEmptyFlatEntityMaps(),
        }),
        flatRoleTargetMaps: createEmptyFlatEntityMaps(),
        flatWebhookMaps: createEmptyFlatEntityMaps(),
      });

    try {
      const result =
        await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
          {
            workspaceId,
            applicationUniversalIdentifier:
              workspaceCustomFlatApplication.universalIdentifier,
            allFlatEntityOperationByMetadataName: {
              role: {
                flatEntityToCreate: [flatRoleToCreate],
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
              roleTarget: {
                flatEntityToCreate: [flatRoleTargetToCreate],
                flatEntityToDelete: [],
                flatEntityToUpdate: [],
              },
            },
          },
        );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(
          result,
          'Could not initialize the agent role',
        );
      }
    } catch (error) {
      const isDeniedInitialization =
        error instanceof PermissionsException ||
        error instanceof AiException ||
        error instanceof WorkspaceMigrationBuilderException;

      if (isDeniedInitialization) {
        throw error;
      }

      const assignedRole = await this.findAssignedRoleOrThrow(context);

      if (!isDefined(assignedRole) || assignedRole.id !== flatRoleToCreate.id) {
        throw error;
      }

      return assignedRole;
    }

    const assignedRole = await this.findAssignedRoleOrThrow(context);

    if (!isDefined(assignedRole)) {
      throw new PermissionsException(
        'Initialized agent role not found',
        PermissionsExceptionCode.ROLE_NOT_FOUND,
      );
    }

    return assignedRole;
  }
}
