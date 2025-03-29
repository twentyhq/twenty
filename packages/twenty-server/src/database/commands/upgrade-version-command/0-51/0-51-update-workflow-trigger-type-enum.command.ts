import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { WorkspaceDataSourceService } from 'src/engine/workspace-datasource/workspace-datasource.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { computeTableName } from 'src/engine/utils/compute-table-name.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Command({
  name: 'upgrade:0-51:upgrade-created-by-enum',
  description: 'Upgrade created by enum',
})
export class UpgradeCreatedByEnumCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly workspaceDataSourceService: WorkspaceDataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    const schemaName =
      this.workspaceDataSourceService.getSchemaName(workspaceId);

    const workspaceDataSource =
      await this.twentyORMGlobalManager.getDataSourceForWorkspace(workspaceId);

    const objectMetadatas = await this.objectMetadataRepository.find({
      where: {
        workspaceId,
      },
      relations: ['fields'],
    });

    const queryRunner = workspaceDataSource?.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const objectMetadata of objectMetadatas) {
        if (
          !isDefined(
            objectMetadata.fields.find((field) => field.name === 'createdBy'),
          )
        ) {
          continue;
        }

        const tableToUpdate = computeTableName(
          objectMetadata.nameSingular,
          objectMetadata.isCustom,
        );

        // Set current column as text
        await queryRunner.query(
          `ALTER TABLE "${schemaName}"."${tableToUpdate}"
          ALTER COLUMN "createdBySource" SET DATA TYPE text USING "createdBySource"::text`,
        );

        // Drop default value
        await queryRunner.query(
          `ALTER TABLE "${schemaName}"."${tableToUpdate}"
          ALTER COLUMN "createdBySource" DROP DEFAULT`,
        );

        // Drop the old enum type
        await queryRunner.query(
          `DROP TYPE "${schemaName}"."${tableToUpdate}_createdBySource_enum"`,
        );

        await queryRunner.query(
          `CREATE TYPE "${schemaName}"."${tableToUpdate}_createdBySource_enum" AS ENUM ('EMAIL', 'CALENDAR', 'WORKFLOW', 'API', 'IMPORT', 'MANUAL', 'SYSTEM', 'WEBHOOK')`,
        );

        // Re-apply the enum type
        await queryRunner.query(
          `ALTER TABLE "${schemaName}"."${tableToUpdate}"
            ALTER COLUMN "createdBySource" SET DATA TYPE "${schemaName}"."${tableToUpdate}_createdBySource_enum" USING "createdBySource"::"${schemaName}"."${tableToUpdate}_createdBySource_enum"`,
        );
      }
      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
