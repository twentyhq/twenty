import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';
import { FieldMetadataType } from 'twenty-shared/types';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { getFlatFieldsFromFlatObjectMetadata } from 'src/engine/api/graphql/workspace-schema-builder/utils/get-flat-fields-for-flat-object-metadata.util';
import { findFlatEntityByUniversalIdentifierOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier-or-throw.util';

@Command({
  name: 'upgrade:1-17:transform-all-emails-to-lowercase',
  description: 'Transforms all emails to lowercase',
})
export class TransformAllEmailsToLowercaseCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceEntity: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceEntity, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    options,
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (options.dryRun) {
      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const schemaName = getWorkspaceSchemaName(workspaceId);

      // Find all objects with at least one field of email type
      const { flatObjectMetadataMaps, flatFieldMetadataMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatObjectMetadataMaps',
          'flatFieldMetadataMaps',
        ]);

      for (const universalIdentifier of Object.keys(
        flatObjectMetadataMaps.byUniversalIdentifier,
      )) {
        const objectMetadata =
          findFlatEntityByUniversalIdentifierOrThrow<FlatObjectMetadata>({
            flatEntityMaps: flatObjectMetadataMaps,
            universalIdentifier: universalIdentifier,
          });

        const objectFieldMetadatas = getFlatFieldsFromFlatObjectMetadata(
          objectMetadata,
          flatFieldMetadataMaps,
        );

        const objectEmailFields = objectFieldMetadatas.filter(
          (field) => field.type === FieldMetadataType.EMAILS,
        );

        // Update all columns (fields) of email type
        if (objectEmailFields.length > 0) {
          for (const field of objectEmailFields) {
            const fieldName = field.name;
            const tableName = objectMetadata.isCustom
              ? `_${objectMetadata.nameSingular}`
              : objectMetadata.nameSingular;

            try {
              await queryRunner.query(
                `UPDATE "${schemaName}"."${tableName}"
                 SET "${fieldName}PrimaryEmail" = LOWER("${fieldName}PrimaryEmail")
                 WHERE "${fieldName}PrimaryEmail" IS NOT NULL
                   AND "${fieldName}PrimaryEmail" != LOWER("${fieldName}PrimaryEmail");`,
              );
              this.logger.log(
                `Transformed ${fieldName} primary emails for ${tableName}`,
              );
            } catch (error) {
              this.logger.error(
                `Error transforming "${fieldName}" primary emails for "${tableName}" in workspace ${workspaceId}`,
                error,
              );

              throw error;
            }

            try {
              await queryRunner.query(
                `UPDATE "${schemaName}"."${tableName}"
                 SET "${fieldName}AdditionalEmails" = (SELECT jsonb_agg(LOWER(elem))
                                                       FROM jsonb_array_elements_text("${fieldName}AdditionalEmails") AS elem)
                 WHERE "${fieldName}AdditionalEmails" IS NOT NULL
                   AND "${fieldName}AdditionalEmails" != '[]'::jsonb; `,
              );
              this.logger.log(
                `Transformed ${fieldName} additional emails for ${tableName}`,
              );
            } catch (error) {
              this.logger.error(
                `Error transforming "${fieldName}" additional emails for "${tableName}" in workspace ${workspaceId}`,
                error,
              );

              throw error;
            }
          }
        }
      }
      await queryRunner.commitTransaction();
      this.logger.log(`✅ Successfully transformed all emails to lowercase`);
    } catch (error) {
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
        this.logger.error(
          `Error transforming emails to lowercase (rolled transaction back on ${workspaceId})`,
          error,
        );
      } else {
        this.logger.error(
          `Error transforming emails to lowercase after commit on ${workspaceId}`,
          error,
        );
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
