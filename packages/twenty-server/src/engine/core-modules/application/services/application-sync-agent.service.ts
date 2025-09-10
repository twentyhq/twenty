import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { ApplicationSyncContext } from 'src/engine/core-modules/application/services/application-sync.service';
import { AgentEntity } from 'src/engine/metadata-modules/agent/agent.entity';
import { FlatAgent } from 'src/engine/metadata-modules/flat-agent/types/flat-agent.type';

@Injectable()
export class ApplicationSyncAgentService {
  private readonly logger = new Logger(ApplicationSyncAgentService.name);

  constructor(
    @InjectRepository(AgentEntity)
    private readonly agentRepository: Repository<AgentEntity>,
  ) {}

  async synchronize(
    context: ApplicationSyncContext,
    agents: FlatAgent[],
  ): Promise<void> {
    if (!agents || agents.length === 0) {
      this.logger.log('No agents to synchronize');

      return;
    }

    for (const agentDefinition of agents) {
      this.logger.log(`Syncing agent: ${agentDefinition.label}`);

      // Check if agent already exists
      const existingAgent = await this.agentRepository.findOne({
        where: {
          workspaceId: context.workspaceId,
          applicationId: context.applicationId,
          name: agentDefinition.name,
        },
      });

      if (existingAgent) {
        // Update existing agent
        await this.agentRepository.update(
          { id: existingAgent.id },
          {
            label: agentDefinition.label,
            description: agentDefinition.description,
            icon: agentDefinition.icon,
            prompt: agentDefinition.prompt,
            modelId: agentDefinition.modelId,
          },
        );
        this.logger.log(`Updated agent: ${agentDefinition.label}`);
      } else {
        // Create new agent
        const newAgent = this.agentRepository.create({
          name: agentDefinition.name,
          label: agentDefinition.label,
          description: agentDefinition.description,
          icon: agentDefinition.icon,
          prompt: agentDefinition.prompt,
          modelId: agentDefinition.modelId,
          workspaceId: context.workspaceId,
          applicationId: context.applicationId,
        });

        await this.agentRepository.save(newAgent);
        this.logger.log(`Created agent: ${agentDefinition.label}`);
      }
    }
  }
}
