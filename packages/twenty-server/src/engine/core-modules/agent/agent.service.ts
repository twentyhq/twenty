import { BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { In, Repository } from 'typeorm';

import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Agent } from 'src/engine/core-modules/agent/agent.entity';
import { CreateAgentInput } from 'src/engine/core-modules/agent/dtos/create-agent.input';
import { UpdateAgentInput } from 'src/engine/core-modules/agent/dtos/update-agent.input';
import { Inbox } from 'src/engine/core-modules/inbox/inbox.entity';
import { Sector } from 'src/engine/core-modules/sector/sector.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

export class AgentService {
  constructor(
    @InjectRepository(Agent, 'core')
    private readonly agentRepository: Repository<Agent>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(Sector, 'core')
    private readonly sectorRepository: Repository<Sector>,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    @InjectRepository(Inbox, 'core')
    private readonly inboxRepository: Repository<Inbox>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {}

  async create(createInput: CreateAgentInput): Promise<Agent> {
    const workspace = await this.workspaceRepository.findOne({
      where: {
        id: createInput.workspaceId,
      },
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const sectors = await this.sectorRepository.findBy({
      id: In(createInput.sectorIds),
    });

    if (sectors.length !== createInput.sectorIds.length) {
      throw new Error('One or more sectors not found');
    }

    const inboxes = await this.inboxRepository.findBy({
      id: In(createInput.inboxesIds),
    });

    if (inboxes.length !== createInput.inboxesIds.length) {
      throw new Error('One or more inboxes not found');
    }

    const createdAgent = this.agentRepository.create({
      ...createInput,
      workspace,
      sectors,
      inboxes,
    });

    return await this.agentRepository.save(createdAgent);
  }

  async findAll(workspaceId: string): Promise<Agent[]> {
    return await this.agentRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: [
        'workspace',
        'sectors',
        'inboxes',
        'inboxes.whatsappIntegration',
      ],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findById(agentId: string): Promise<Agent | null> {
    return await this.agentRepository.findOne({
      where: { id: agentId },
      relations: ['workspace', 'sectors', 'inboxes'],
    });
  }

  async update(updateInput: UpdateAgentInput): Promise<Agent> {
    const agent = await this.agentRepository.findOne({
      where: { id: updateInput.id },
      relations: ['workspace', 'sectors', 'inboxes'],
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    const updatedAgent = {
      ...agent,
      ...updateInput,
    };

    if (updateInput.sectorIds && Array.isArray(updateInput.sectorIds)) {
      const sectors = await this.sectorRepository.find({
        where: {
          id: In(updateInput.sectorIds),
        },
      });

      if (sectors.length !== updateInput.sectorIds.length) {
        throw new Error('One or more sectors not found');
      }

      updatedAgent.sectors = sectors;
    }

    if (updateInput.inboxesIds && Array.isArray(updateInput.inboxesIds)) {
      const inboxes = await this.inboxRepository.find({
        where: {
          id: In(updateInput.inboxesIds),
        },
      });

      if (inboxes.length !== updateInput.inboxesIds.length) {
        throw new Error('One or more inboxes not found');
      }

      updatedAgent.inboxes = inboxes;
    }

    return await this.agentRepository.save(updatedAgent);
  }

  async toggleStatus(agentId: string): Promise<boolean> {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    const updatedAgent = {
      ...agent,
      isActive: !agent.isActive,
    };

    await this.agentRepository.save(updatedAgent);

    return updatedAgent.isActive;
  }

  async delete(agentId: string): Promise<boolean> {
    const agent = await this.agentRepository.findOne({
      where: { id: agentId },
    });

    if (agent) {
      const { affected } = await this.agentRepository.delete(agentId);

      if (!affected) {
        throw new BadRequestException(undefined, {
          description: 'Error when removing agent',
        });
      }

      return affected ? true : false;
    }

    throw new BadRequestException(undefined, {
      description: 'Agent not found',
    });
  }

  getWorkspaceMemberById = async (workspaceId: string, memberId: string) => {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId,
      });

    const workspaceMembers = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."workspaceMember" WHERE "id"='${memberId}'`,
    );

    return workspaceMembers?.[0] || null;
  };

  setAgentIdInWorkspaceMember = async (
    workspaceId: string,
    memberId: string,
    newAgentId: string,
  ) => {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId,
      });

    await workspaceDataSource?.query(
      `UPDATE ${dataSourceMetadata.schema}."workspaceMember" SET "agentId"='${newAgentId}' WHERE "id"='${memberId}'`,
    );

    const updatedWorkspaceMember = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."workspaceMember" WHERE "id"='${memberId}'`,
    );

    return updatedWorkspaceMember?.[0] || null;
  };

  removeAgentIdInWorkspaceMember = async (
    workspaceId: string,
    memberId: string,
  ) => {
    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        workspaceId,
      );

    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace({
        workspaceId,
      });

    await workspaceDataSource?.query(
      `UPDATE ${dataSourceMetadata.schema}."workspaceMember" SET "agentId"='' WHERE "id"='${memberId}'`,
    );

    const updatedWorkspaceMember = await workspaceDataSource?.query(
      `SELECT * FROM ${dataSourceMetadata.schema}."workspaceMember" WHERE "id"='${memberId}'`,
    );

    return updatedWorkspaceMember?.[0] || null;
  };
}
