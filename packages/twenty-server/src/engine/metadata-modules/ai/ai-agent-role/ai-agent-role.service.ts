import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Not } from 'typeorm';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleTargetService } from 'src/engine/metadata-modules/role-target/services/role-target.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
@Injectable()
export class AiAgentRoleService {
  constructor(
    @InjectWorkspaceScopedRepository(AgentEntity)
    private readonly agentRepository: WorkspaceScopedRepository<AgentEntity>,
    @InjectWorkspaceScopedRepository(RoleEntity)
    private readonly roleRepository: WorkspaceScopedRepository<RoleEntity>,
    @InjectWorkspaceScopedRepository(RoleTargetEntity)
    private readonly roleTargetRepository: WorkspaceScopedRepository<RoleTargetEntity>,
    private readonly roleTargetService: RoleTargetService,
  ) {}

  public async assignRoleToAgent({
    workspaceId,
    agentId,
    roleId,
  }: {
    workspaceId: string;
    agentId: string;
    roleId: string;
  }): Promise<void> {
    const validationResult = await this.validateAssignRoleInput({
      agentId,
      workspaceId,
      roleId,
    });

    if (validationResult?.roleToAssignIsSameAsCurrentRole) {
      return;
    }

    await this.roleTargetService.create({
      createRoleTargetInput: {
        roleId,
        targetId: agentId,
        targetMetadataForeignKey: 'agentId',
      },
      workspaceId,
    });
  }

  public async removeRoleFromAgent({
    workspaceId,
    agentId,
  }: {
    workspaceId: string;
    agentId: string;
  }): Promise<void> {
    const existingRoleTarget = await this.roleTargetRepository.findOne(
      workspaceId,
      {
        where: {
          agentId,
        },
      },
    );

    if (!isDefined(existingRoleTarget)) {
      throw new AiException(
        `Role target not found for agent ${agentId}`,
        AiExceptionCode.ROLE_NOT_FOUND,
      );
    }

    await this.roleTargetService.delete({
      id: existingRoleTarget.id,
      workspaceId,
    });
  }

  public async getAgentsAssignedToRole(
    roleId: string,
    workspaceId: string,
  ): Promise<AgentEntity[]> {
    const roleTargets = await this.roleTargetRepository.find(workspaceId, {
      where: {
        roleId,
        agentId: Not(IsNull()),
      },
    });

    const agentIds = roleTargets
      .map((roleTarget) => roleTarget.agentId)
      .filter((agentId): agentId is string => agentId !== null);

    if (!agentIds.length) {
      return [];
    }

    const agents = await this.agentRepository.find(workspaceId, {
      where: { id: In(agentIds) },
    });

    return agents;
  }

  private async validateAssignRoleInput({
    agentId,
    workspaceId,
    roleId,
  }: {
    agentId: string;
    workspaceId: string;
    roleId: string;
  }) {
    const agent = await this.agentRepository.findOne(workspaceId, {
      where: { id: agentId },
    });

    if (!agent) {
      throw new AiException(
        `Agent with id ${agentId} not found in workspace`,
        AiExceptionCode.AGENT_NOT_FOUND,
      );
    }

    const role = await this.roleRepository.findOne(workspaceId, {
      where: { id: roleId },
    });

    if (!role) {
      throw new AiException(
        `Role with id ${roleId} not found in workspace`,
        AiExceptionCode.ROLE_NOT_FOUND,
      );
    }

    if (!role.canBeAssignedToAgents) {
      throw new AiException(
        `Role "${role.label}" cannot be assigned to agents`,
        AiExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS,
      );
    }

    const existingRoleTarget = await this.roleTargetRepository.findOne(
      workspaceId,
      {
        where: {
          agentId,
          roleId,
        },
      },
    );

    return {
      roleToAssignIsSameAsCurrentRole: Boolean(existingRoleTarget),
    };
  }

  public async deleteAgentOnlyRoleIfUnused({
    roleId,
    roleTargetId,
    workspaceId,
  }: {
    roleId: string;
    roleTargetId: string;
    workspaceId: string;
  }): Promise<void> {
    const role = await this.roleRepository.findOne(workspaceId, {
      where: { id: roleId },
    });

    if (
      !isDefined(role) ||
      !role.canBeAssignedToAgents ||
      role.canBeAssignedToUsers ||
      role.canBeAssignedToApiKeys
    ) {
      return;
    }

    const remainingAssignments = await this.roleTargetRepository.count(
      workspaceId,
      {
        where: {
          roleId,
          id: Not(roleTargetId),
        },
      },
    );

    if (remainingAssignments === 0) {
      await this.roleRepository.delete(workspaceId, { id: roleId });
    }
  }
}
