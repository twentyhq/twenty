import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, IsNull } from 'typeorm';
import { v4 } from 'uuid';

import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { PermissionFlagEntity } from 'src/engine/metadata-modules/permission-flag/permission-flag.entity';

@Command({
  name: 'upgrade:1-20:identify-permission-flag-metadata',
  description:
    'Identify permission flag metadata (backfill universalIdentifier and applicationId)',
})
export class IdentifyPermissionFlagMetadataCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  private hasRunOnce = false;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (this.hasRunOnce) {
      this.logger.log(
        'Skipping has already been run once IdentifyPermissionFlagMetadataCommand',
      );

      return;
    }

    if (options.dryRun) {
      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const repository =
        queryRunner.manager.getRepository(PermissionFlagEntity);
      const withNullApplicationId = await repository.find({
        where: {
          applicationId: IsNull(),
        },
        relations: ['role'],
      });

      const toUpdate = withNullApplicationId.filter((permissionFlag) =>
        isDefined(permissionFlag.role?.applicationId),
      );
      const toRemove = withNullApplicationId.filter(
        (permissionFlag) => !isDefined(permissionFlag.role?.applicationId),
      );

      for (const permissionFlag of toUpdate) {
        const flag = permissionFlag;
        flag.applicationId = permissionFlag.role.applicationId;
        flag.universalIdentifier = flag.universalIdentifier ?? v4();
      }

      if (toUpdate.length > 0) {
        await repository.save(toUpdate);
      }
      if (toRemove.length > 0) {
        await repository.remove(toRemove);
      }

      const withNullUniversalIdentifier = await repository.find({
        where: {
          universalIdentifier: IsNull(),
        },
      });

      for (const permissionFlag of withNullUniversalIdentifier) {
        permissionFlag.universalIdentifier = v4();
      }

      if (withNullUniversalIdentifier.length > 0) {
        await repository.save(withNullUniversalIdentifier);
      }

      await queryRunner.commitTransaction();
      this.logger.log('Successfully run IdentifyPermissionFlagMetadataCommand');
      this.hasRunOnce = true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Rolling back IdentifyPermissionFlagMetadataCommand: ${error.message}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
