import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import { computeMetadataNameFromLabel } from 'twenty-shared/metadata';
import { In, Repository } from 'typeorm';

import { AiAgentRoleService } from 'src/engine/metadata-modules/ai/ai-agent-role/ai-agent-role.service';
import { type CreateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/create-agent.input';
import { type UpdateAgentInput } from 'src/engine/metadata-modules/ai/ai-agent/dtos/update-agent.input';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';

import { AgentException, AgentExceptionCode } from './agent.exception';

import { AgentEntity } from './entities/agent.entity';

@Injectable()
export class AgentService {
  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetsRepository: Repository<RoleTargetEntity>,
    private readonly agentRoleService: AiAgentRoleService,
  ) {}

  async findManyAgents(workspaceId: string) {
    const agents = await this.agentRepository.find({
      where: { workspaceId },
      order: { createdAt: 'DESC' },
    });

    if (agents.length === 0) {
      return [];
    }

    const agentRoleMap = await this.buildAgentRoleMap(workspaceId, agents);

    return agents.map((agent) => ({
      ...agent,
      roleId: agentRoleMap.get(agent.id) || null,
    }));
  }

  private async buildAgentRoleMap(
    workspaceId: string,
    agents: AgentEntity[],
  ): Promise<Map<string, string>> {
    const roleTargets = await this.roleTargetsRepository.find({
      where: {
        workspaceId,
        agentId: In(agents.map((agent) => agent.id)),
      },
    });

    const agentRoleMap = new Map<string, string>();

    roleTargets.forEach((roleTarget) => {
      if (roleTarget.agentId) {
        agentRoleMap.set(roleTarget.agentId, roleTarget.roleId);
      }
    });

    return agentRoleMap;
  }

  async findOneByApplicationAndStandardId({
    applicationId,
    standardId,
    workspaceId,
  }: {
    applicationId: string;
    standardId: string;
    workspaceId: string;
  }) {
    return await this.agentRepository.findOne({
      where: { applicationId, standardId, workspaceId },
    });
  }

  async findOneAgent(
    workspaceId: string,
    { id, name }: { id?: string; name?: string },
  ) {
    this.validateAgentIdentifier(id, name);

    const agent = await this.fetchAgent(workspaceId, id, name);
    const roleId = await this.fetchAgentRoleId(workspaceId, agent.id);

    return {
      ...agent,
      roleId,
    };
  }

  private validateAgentIdentifier(
    id: string | undefined,
    name: string | undefined,
  ): void {
    if (!isNonEmptyString(id) && !isNonEmptyString(name)) {
      throw new AgentException(
        'Either id or name must be provided',
        AgentExceptionCode.AGENT_NOT_FOUND,
      );
    }

    if (isNonEmptyString(id) && isNonEmptyString(name)) {
      throw new AgentException(
        'Cannot specify both id and name',
        AgentExceptionCode.AGENT_NOT_FOUND,
      );
    }
  }

  private async fetchAgent(
    workspaceId: string,
    id: string | undefined,
    name: string | undefined,
  ): Promise<AgentEntity> {
    const agent = await this.agentRepository.findOne({
      where: id ? { id, workspaceId } : { name, workspaceId },
    });

    if (!agent) {
      const identifier = id ? `id "${id}"` : `name "${name}"`;

      throw new AgentException(
        `Agent with ${identifier} not found`,
        AgentExceptionCode.AGENT_NOT_FOUND,
      );
    }

    return agent;
  }

  private async fetchAgentRoleId(
    workspaceId: string,
    agentId: string,
  ): Promise<string | null> {
    const roleTarget = await this.roleTargetsRepository.findOne({
      where: {
        agentId,
        workspaceId,
      },
      select: ['roleId'],
    });

    return roleTarget?.roleId || null;
  }

  async createOneAgent(
    input: CreateAgentInput & { isCustom: boolean },
    workspaceId: string,
  ) {
    const agent = this.buildNewAgent(input, workspaceId);
    const createdAgent = await this.agentRepository.save(agent);

    if (isNonEmptyString(input.roleId)) {
      await this.assignRoleToNewAgent(
        workspaceId,
        createdAgent.id,
        input.roleId,
      );
    }

    return this.findOneAgent(workspaceId, { id: createdAgent.id });
  }

  private buildNewAgent(
    input: CreateAgentInput & { isCustom: boolean },
    workspaceId: string,
  ): AgentEntity {
    return this.agentRepository.create({
      ...input,
      name: isNonEmptyString(input.name)
        ? input.name
        : computeMetadataNameFromLabel(input.label),
      workspaceId,
      isCustom: input.isCustom,
    });
  }

  private async assignRoleToNewAgent(
    workspaceId: string,
    agentId: string,
    roleId: string,
  ): Promise<void> {
    await this.agentRoleService.assignRoleToAgent({
      workspaceId,
      agentId,
      roleId,
    });
  }

  async updateOneAgent(input: UpdateAgentInput, workspaceId: string) {
    const agent = await this.findOneAgent(workspaceId, { id: input.id });
    const updateData = this.buildUpdateData(agent, input);
    const updatedAgent = await this.agentRepository.save(updateData);

    if (!('roleId' in input)) {
      return updatedAgent;
    }

    await this.updateAgentRole(workspaceId, agent.id, input.roleId);

    return this.findOneAgent(workspaceId, { id: updatedAgent.id });
  }

  private buildUpdateData(
    agent: AgentEntity & { roleId: string | null },
    input: UpdateAgentInput,
  ): Partial<AgentEntity> {
    const updateData: Partial<AgentEntity> = {
      ...agent,
      ...Object.fromEntries(
        Object.entries(input).filter(([_, value]) => value !== undefined),
      ),
    };

    if (input.label !== undefined) {
      updateData.name = computeMetadataNameFromLabel(input.label);
    } else if (input.name !== undefined) {
      updateData.name = input.name;
    }

    return updateData;
  }

  private async updateAgentRole(
    workspaceId: string,
    agentId: string,
    roleId: string | null | undefined,
  ): Promise<void> {
    if (isNonEmptyString(roleId)) {
      await this.agentRoleService.assignRoleToAgent({
        workspaceId,
        agentId,
        roleId,
      });

      return;
    }

    await this.agentRoleService.removeRoleFromAgent({
      workspaceId,
      agentId,
    });
  }

  async deleteOneAgent(id: string, workspaceId: string) {
    const agent = await this.findOneAgent(workspaceId, { id });

    await this.agentRepository.softDelete({ id: agent.id });

    return agent;
  }
}
