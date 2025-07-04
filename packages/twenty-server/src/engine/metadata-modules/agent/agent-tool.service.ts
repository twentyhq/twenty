import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ToolSet } from 'ai';
import { Repository } from 'typeorm';

import { AgentService } from 'src/engine/metadata-modules/agent/agent.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { ToolService } from 'src/engine/core-modules/ai/services/tool.service';

@Injectable()
export class AgentToolService {
  constructor(
    private readonly agentService: AgentService,
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    private readonly toolService: ToolService,
  ) {}

  async generateToolsForAgent(
    agentId: string,
    workspaceId: string,
  ): Promise<ToolSet> {
    try {
      const agent = await this.agentService.findOneAgent(agentId, workspaceId);

      if (!agent.roleId) {
        return {};
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

      return this.toolService.listTools(role.id, workspaceId);
    } catch (error) {
      return {};
    }
  }
}
