import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ToolSet } from 'ai';
import { Repository } from 'typeorm';

import { ToolAdapterService } from 'src/engine/core-modules/ai/services/tool-adapter.service';
import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';
import { AgentService } from 'src/engine/metadata-modules/agent/agent.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';

@Injectable()
export class AgentToolService {
  constructor(
    private readonly agentService: AgentService,
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly toolService: ToolService,
    private readonly toolAdapterService: ToolAdapterService,
  ) {}

  async generateToolsForAgent(
    agentId: string,
    workspaceId: string,
  ): Promise<ToolSet> {
    try {
      const agent = await this.agentService.findOneAgent(agentId, workspaceId);

      const actionTools = this.toolAdapterService.getCoreTools();

      if (!agent.roleId) {
        return actionTools;
      }

      const role = await this.roleRepository.findOne({
        where: {
          id: agent.roleId,
          workspaceId,
        },
      });

      if (!role) {
        return {};
      }

      const databaseTools = await this.toolService.listTools(
        role.id,
        workspaceId,
      );

      return { ...databaseTools, ...actionTools };
    } catch (error) {
      return {};
    }
  }
}
