import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { DataSource } from 'typeorm';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';

@Command({
  name: 'upgrade:1-20:backfill-select-field-option-ids',
  description:
    'Backfill missing ids on SELECT and MULTI_SELECT field metadata options',
})
export class BackfillSelectFieldOptionIdsCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const dryRun = options?.dryRun ?? false;

    const selectFields: { id: string; options: Record<string, unknown>[] }[] =
      await this.coreDataSource.query(
        `SELECT "id", "options"
         FROM core."fieldMetadata"
         WHERE "workspaceId" = $1
           AND "type" IN ('SELECT', 'MULTI_SELECT')
           AND "options" IS NOT NULL`,
        [workspaceId],
      );

    const fieldsToUpdate = selectFields.filter((field) =>
      field.options.some((option) => !isDefined(option.id)),
    );

    if (fieldsToUpdate.length === 0) {
      this.logger.log(
        `No SELECT/MULTI_SELECT options missing ids in workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${dryRun ? '[DRY RUN] ' : ''}Found ${fieldsToUpdate.length} field(s) with options missing ids in workspace ${workspaceId}`,
    );

    if (dryRun) {
      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const field of fieldsToUpdate) {
        const patchedOptions = field.options.map((option) => ({
          ...option,
          id: isDefined(option.id) ? option.id : v4(),
        }));

        await queryRunner.query(
          `UPDATE core."fieldMetadata"
           SET "options" = $1::jsonb
           WHERE "id" = $2`,
          [JSON.stringify(patchedOptions), field.id],
        );
      }

      await queryRunner.commitTransaction();

      this.logger.log(
        `Backfilled option ids for ${fieldsToUpdate.length} field(s) in workspace ${workspaceId}`,
      );
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
