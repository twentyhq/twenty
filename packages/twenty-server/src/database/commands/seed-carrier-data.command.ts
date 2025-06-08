import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { In } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { WorkspaceEntityManager } from 'src/engine/twenty-orm/entity-manager/workspace-entity-manager';
import { seedCarrierWithDemoData } from 'src/engine/workspace-manager/demo-objects-prefill-data/seed-carrier-with-demo-data';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { Repository } from 'typeorm';

@Command({
  name: 'workspace:seed:carrier-data',
  description: 'Seed workspace with carrier data.',
})
export class SeedCarrierDataCommand extends CommandRunner {
  private readonly logger = new Logger(SeedCarrierDataCommand.name);

  constructor(
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      const mainDataSource = this.typeORMService.getMainDataSource();

      if (!mainDataSource) {
        throw new Error('Could not connect to workspace data source');
      }

      // Get all active workspaces
      const activeWorkspaces = await this.workspaceRepository.find({
        where: {
          activationStatus: In([
            WorkspaceActivationStatus.ACTIVE,
            WorkspaceActivationStatus.SUSPENDED,
          ]),
        },
      });

      for (const workspace of activeWorkspaces) {
        try {
          const dataSourceMetadata = await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
            workspace.id,
          );

          await seedCarrierWithDemoData(
            mainDataSource.createEntityManager() as WorkspaceEntityManager,
            dataSourceMetadata.schema,
          );

          this.logger.log(`Successfully seeded carrier data for workspace ${workspace.displayName}`);
        } catch (error) {
          this.logger.error(`Error seeding carrier data for workspace ${workspace.displayName}:`, error);
          // Continue with next workspace even if one fails
          continue;
        }
      }

      this.logger.log('Finished seeding carrier data for all workspaces');
    } catch (error) {
      this.logger.error('Error in carrier data seeding process:', error);
      throw error;
    }
  }
} 