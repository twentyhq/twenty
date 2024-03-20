import { Command, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';

import { DataSourceService } from 'src/engine-metadata/data-source/data-source.service';
import { seedCompanies } from 'src/database/typeorm-seeds/workspace/companies';
import { seedViews } from 'src/database/typeorm-seeds/workspace/views';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { seedOpportunity } from 'src/database/typeorm-seeds/workspace/opportunity';
import { seedPipelineStep } from 'src/database/typeorm-seeds/workspace/pipeline-step';
import { seedWorkspaceMember } from 'src/database/typeorm-seeds/workspace/workspaceMember';
import { seedPeople } from 'src/database/typeorm-seeds/workspace/people';
import { seedCoreSchema } from 'src/database/typeorm-seeds/core';
import { ObjectMetadataService } from 'src/engine-metadata/object-metadata/object-metadata.service';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { WorkspaceSyncMetadataService } from 'src/engine/workspace-manager/workspace-sync-metadata/workspace-sync-metadata.service';
import { seedCalendarEvents } from 'src/database/typeorm-seeds/workspace/calendar-events';
import { EnvironmentService } from 'src/engine/integrations/environment/environment.service';
import {
  SeedAppleWorkspaceId,
  SeedTwentyWorkspaceId,
} from 'src/database/typeorm-seeds/core/workspaces';

// TODO: implement dry-run
@Command({
  name: 'workspace:seed:dev',
  description:
    'Seed workspace with initial data. This command is intended for development only.',
})
export class DataSeedWorkspaceCommand extends CommandRunner {
  workspaceIds = [SeedAppleWorkspaceId, SeedTwentyWorkspaceId];

  constructor(
    private readonly environmentService: EnvironmentService,
    private readonly dataSourceService: DataSourceService,
    private readonly typeORMService: TypeORMService,
    private readonly workspaceSyncMetadataService: WorkspaceSyncMetadataService,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
    private readonly objectMetadataService: ObjectMetadataService,
  ) {
    super();
  }

  async run(): Promise<void> {
    try {
      const dataSource = new DataSource({
        url: this.environmentService.get('PG_DATABASE_URL'),
        type: 'postgres',
        logging: true,
        schema: 'core',
      });

      for (const workspaceId of this.workspaceIds) {
        await dataSource.initialize();

        await seedCoreSchema(dataSource, workspaceId);

        await dataSource.destroy();

        const schemaName =
          await this.workspaceDataSourceService.createWorkspaceDBSchema(
            workspaceId,
          );

        const dataSourceMetadata =
          await this.dataSourceService.createDataSourceMetadata(
            workspaceId,
            schemaName,
          );

        await this.workspaceSyncMetadataService.synchronize({
          workspaceId: workspaceId,
          dataSourceId: dataSourceMetadata.id,
        });
      }
    } catch (error) {
      console.error(error);

      return;
    }

    for (const workspaceId of this.workspaceIds) {
      const dataSourceMetadata =
        await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
          workspaceId,
        );

      const workspaceDataSource =
        await this.typeORMService.connectToDataSource(dataSourceMetadata);

      if (!workspaceDataSource) {
        throw new Error('Could not connect to workspace data source');
      }

      try {
        const objectMetadata =
          await this.objectMetadataService.findManyWithinWorkspace(workspaceId);
        const objectMetadataMap = objectMetadata.reduce((acc, object) => {
          acc[object.nameSingular] = {
            id: object.id,
            fields: object.fields.reduce((acc, field) => {
              acc[field.name] = field.id;

              return acc;
            }, {}),
          };

          return acc;
        }, {});

        await seedCompanies(workspaceDataSource, dataSourceMetadata.schema);
        await seedPeople(workspaceDataSource, dataSourceMetadata.schema);
        await seedPipelineStep(workspaceDataSource, dataSourceMetadata.schema);
        await seedOpportunity(workspaceDataSource, dataSourceMetadata.schema);
        await seedCalendarEvents(
          workspaceDataSource,
          dataSourceMetadata.schema,
        );

        await seedViews(
          workspaceDataSource,
          dataSourceMetadata.schema,
          objectMetadataMap,
        );
        await seedWorkspaceMember(
          workspaceDataSource,
          dataSourceMetadata.schema,
          workspaceId,
        );
      } catch (error) {
        console.error(error);
      }

      await this.typeORMService.disconnectFromDataSource(dataSourceMetadata.id);
    }
  }
}
