import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  MigrationCommandOptions,
  MigrationCommandRunner,
} from 'src/database/commands/command-runners/migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

@Command({
  name: 'field-metadata:list-orphaned',
  description:
    'List and optionally delete FieldMetadataEntity records that reference a workspaceId not present in the workspace table',
})
export class ListOrphanedFieldMetadataCommand extends MigrationCommandRunner {
  constructor(
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super();
  }

  override async runMigrationCommand(
    _passedParams: string[],
    options: MigrationCommandOptions,
  ): Promise<void> {
    this.logger.log(
      chalk.blue('Looking for orphaned FieldMetadataEntity records...'),
    );

    const orphanedFieldMetadata = await this.fieldMetadataRepository
      .createQueryBuilder('fieldMetadata')
      .where((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from(WorkspaceEntity, 'workspace')
          .where('workspace.id = fieldMetadata.workspaceId')
          .getQuery();

        return `NOT EXISTS ${subQuery}`;
      })
      .getMany();

    if (orphanedFieldMetadata.length === 0) {
      this.logger.log(
        chalk.green('No orphaned FieldMetadataEntity records found.'),
      );

      return;
    }

    this.logger.log(
      chalk.yellow(
        `Found ${orphanedFieldMetadata.length} orphaned FieldMetadataEntity record(s):`,
      ),
    );

    const orphanedWorkspaceIds = [
      ...new Set(orphanedFieldMetadata.map((fm) => fm.workspaceId)),
    ];

    this.logger.log(
      chalk.yellow(
        `Orphaned workspace IDs (${orphanedWorkspaceIds.length}): ${orphanedWorkspaceIds.join(', ')}`,
      ),
    );

    for (const fieldMetadata of orphanedFieldMetadata) {
      this.logger.log(
        chalk.gray(
          `  - ID: ${fieldMetadata.id}, Name: ${fieldMetadata.name}, WorkspaceId: ${fieldMetadata.workspaceId}`,
        ),
      );
    }

    if (options.dryRun) {
      this.logger.log(
        chalk.yellow(
          `Dry run mode: ${orphanedFieldMetadata.length} record(s) would be deleted.`,
        ),
      );

      return;
    }

    this.logger.log(
      chalk.red(
        `Deleting ${orphanedFieldMetadata.length} orphaned FieldMetadataEntity record(s)...`,
      ),
    );

    const orphanedIds = orphanedFieldMetadata.map((fm) => fm.id);

    const deleteResult = await this.fieldMetadataRepository
      .createQueryBuilder()
      .delete()
      .from(FieldMetadataEntity)
      .whereInIds(orphanedIds)
      .execute();

    this.logger.log(
      chalk.green(
        `Successfully deleted ${deleteResult.affected} orphaned FieldMetadataEntity record(s).`,
      ),
    );
  }
}
