import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Not, Repository } from 'typeorm';

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
    @InjectRepository(AgentEntity, 'core')
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RoleTargetsEntity, 'core')
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
        AgentExceptionCode.AGENT_EXECUTION_FAILED,
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
