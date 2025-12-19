import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Not, Repository } from 'typeorm';

import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/ai/ai-agent/agent.exception';
import { AgentEntity } from 'src/engine/metadata-modules/ai/ai-agent/entities/agent.entity';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleTargetService } from 'src/engine/metadata-modules/role-target/services/role-target.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

@Injectable()
export class AiAgentRoleService {
  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
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
    const existingRoleTarget = await this.roleTargetRepository.findOne({
      where: {
        agentId,
        workspaceId,
      },
    });

    if (!isDefined(existingRoleTarget)) {
      throw new AgentException(
        `Role target not found for agent ${agentId}`,
        AgentExceptionCode.ROLE_NOT_FOUND,
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
    const roleTargets = await this.roleTargetRepository.find({
      where: {
        roleId,
        workspaceId,
        agentId: Not(IsNull()),
      },
    });

    const agentIds = roleTargets
      .map((roleTarget) => roleTarget.agentId)
      .filter((agentId): agentId is string => agentId !== null);

    if (!agentIds.length) {
      return [];
    }

    const agents = await this.agentRepository.find({
      where: {
        id: In(agentIds),
        workspaceId,
      },
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
    const agent = await this.agentRepository.findOne({
      where: { id: agentId, workspaceId },
    });

    if (!agent) {
      throw new AgentException(
        `Agent with id ${agentId} not found in workspace`,
        AgentExceptionCode.AGENT_NOT_FOUND,
      );
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId, workspaceId },
    });

    if (!role) {
      throw new AgentException(
        `Role with id ${roleId} not found in workspace`,
        AgentExceptionCode.ROLE_NOT_FOUND,
      );
    }

    if (!role.canBeAssignedToAgents) {
      throw new AgentException(
        `Role "${role.label}" cannot be assigned to agents`,
        AgentExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_AGENTS,
      );
    }

    const existingRoleTarget = await this.roleTargetRepository.findOne({
      where: {
        agentId,
        roleId,
        workspaceId,
      },
    });

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
    const role = await this.roleRepository.findOne({
      where: { id: roleId, workspaceId },
    });

    if (
      !isDefined(role) ||
      !role.canBeAssignedToAgents ||
      role.canBeAssignedToUsers ||
      role.canBeAssignedToApiKeys
    ) {
      return;
    }

    const remainingAssignments = await this.roleTargetRepository.count({
      where: {
        roleId,
        workspaceId,
        id: Not(roleTargetId),
      },
    });

    if (remainingAssignments === 0) {
      await this.roleRepository.delete({ id: roleId, workspaceId });
    }
  }
}
