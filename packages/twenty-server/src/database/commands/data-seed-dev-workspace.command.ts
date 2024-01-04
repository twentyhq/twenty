import { Command, CommandRunner } from 'nest-commander';
import { DataSource } from 'typeorm';

import { DataSourceService } from 'src/metadata/data-source/data-source.service';
import { seedCompanies } from 'src/database/typeorm-seeds/workspace/companies';
import { seedViews } from 'src/database/typeorm-seeds/workspace/views';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { seedOpportunity } from 'src/database/typeorm-seeds/workspace/opportunity';
import { seedPipelineStep } from 'src/database/typeorm-seeds/workspace/pipeline-step';
import { seedWorkspaceMember } from 'src/database/typeorm-seeds/workspace/workspaceMember';
import { seedPeople } from 'src/database/typeorm-seeds/workspace/people';
import { seedCoreSchema } from 'src/database/typeorm-seeds/core';
import { EnvironmentService } from 'src/integrations/environment/environment.service';
import { WorkspaceSyncMetadataService } from 'src/workspace/workspace-sync-metadata/workspace-sync.metadata.service';
import { WorkspaceDataSourceService } from 'src/workspace/workspace-datasource/workspace-datasource.service';
import { ObjectMetadataService } from 'src/metadata/object-metadata/object-metadata.service';

// TODO: implement dry-run
@Command({
  name: 'workspace:seed:dev',
  description:
    'Seed workspace with initial data. This command is intended for development only.',
})
export class DataSeedWorkspaceCommand extends CommandRunner {
  workspaceId = '20202020-1c25-4d02-bf25-6aeccf7ea419';

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
        url: this.environmentService.getPGDatabaseUrl(),
        type: 'postgres',
        logging: true,
        schema: 'core',
      });

      await dataSource.initialize();

      await seedCoreSchema(dataSource, this.workspaceId);

      await dataSource.destroy();

      const schemaName =
        await this.workspaceDataSourceService.createWorkspaceDBSchema(
          this.workspaceId,
        );

      const dataSourceMetadata =
        await this.dataSourceService.createDataSourceMetadata(
          this.workspaceId,
          schemaName,
        );

      await this.workspaceSyncMetadataService.syncStandardObjectsAndFieldsMetadata(
        dataSourceMetadata.id,
        this.workspaceId,
      );
    } catch (error) {
      console.error(error);

      return;
    }

    const dataSourceMetadata =
      await this.dataSourceService.getLastDataSourceMetadataFromWorkspaceIdOrFail(
        this.workspaceId,
      );

    const workspaceDataSource =
      await this.typeORMService.connectToDataSource(dataSourceMetadata);

    if (!workspaceDataSource) {
      throw new Error('Could not connect to workspace data source');
    }

    try {
      const objectMetadata =
        await this.objectMetadataService.findManyWithinWorkspace(
          this.workspaceId,
        );
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

      await seedViews(
        workspaceDataSource,
        dataSourceMetadata.schema,
        objectMetadataMap,
      );
      await seedWorkspaceMember(workspaceDataSource, dataSourceMetadata.schema);
    } catch (error) {
      console.error(error);
    }

    await this.typeORMService.disconnectFromDataSource(dataSourceMetadata.id);
  }
}
