import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, IsNull, Not, Repository } from 'typeorm';

import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import {
  AgentException,
  AgentExceptionCode,
} from 'src/engine/metadata-modules/agent/agent.exception';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

@Injectable()
export class AgentRoleService {
  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RoleTargetsEntity)
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
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

    const newRoleTarget = await this.roleTargetsRepository.save({
      roleId,
      agentId,
      workspaceId,
    });

    await this.roleTargetsRepository.delete({
      agentId,
      workspaceId,
      id: Not(newRoleTarget.id),
    });
  }

  public async assignStandardRoleToAgent({
    workspaceId,
    agentId,
    standardRoleId,
  }: {
    workspaceId: string;
    agentId: string;
    standardRoleId: string;
  }) {
    const role = await this.roleRepository.findOne({
      where: { standardId: standardRoleId, workspaceId },
    });

    if (!role) {
      throw new AgentException(
        `Standard role with standard ID ${standardRoleId} not found in workspace`,
        AgentExceptionCode.ROLE_NOT_FOUND,
      );
    }

    await this.assignRoleToAgent({
      workspaceId,
      agentId,
      roleId: role.id,
    });
  }

  public async removeRoleFromAgent({
    workspaceId,
    agentId,
  }: {
    workspaceId: string;
    agentId: string;
  }): Promise<void> {
    await this.roleTargetsRepository.delete({
      agentId,
      workspaceId,
    });
  }

  public async getAgentsAssignedToRole(
    roleId: string,
    workspaceId: string,
  ): Promise<AgentEntity[]> {
    const roleTargets = await this.roleTargetsRepository.find({
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

    const existingRoleTarget = await this.roleTargetsRepository.findOne({
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
}
