import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, IsNull } from 'typeorm';
import { v4 } from 'uuid';

import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { ObjectPermissionEntity } from 'src/engine/metadata-modules/object-permission/object-permission.entity';

@Command({
  name: 'upgrade:1-20:identify-object-permission-metadata',
  description:
    'Identify object permission metadata (backfill universalIdentifier and applicationId)',
})
export class IdentifyObjectPermissionMetadataCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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
        'Skipping has already been run once IdentifyObjectPermissionMetadataCommand',
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
      const repository = queryRunner.manager.getRepository(
        ObjectPermissionEntity,
      );
      const withNullApplicationId = await repository.find({
        where: { applicationId: IsNull() },
        relations: ['role'],
      });

      const toUpdate = withNullApplicationId.filter((objectPermission) =>
        isDefined(objectPermission.role?.applicationId),
      );
      const toRemove = withNullApplicationId.filter(
        (objectPermission) => !isDefined(objectPermission.role?.applicationId),
      );

      for (const objectPermission of toUpdate) {
        objectPermission.applicationId = objectPermission.role!.applicationId;
        objectPermission.universalIdentifier =
          objectPermission.universalIdentifier ?? v4();
      }

      if (toUpdate.length > 0) {
        await repository.save(toUpdate);
      }
      if (toRemove.length > 0) {
        await repository.remove(toRemove);
      }

      const withNullUniversalIdentifier = await repository.find({
        where: { universalIdentifier: IsNull() },
      });

      for (const objectPermission of withNullUniversalIdentifier) {
        objectPermission.universalIdentifier = v4();
      }

      if (withNullUniversalIdentifier.length > 0) {
        await repository.save(withNullUniversalIdentifier);
      }

      await queryRunner.commitTransaction();
      this.logger.log(
        'Successfully run IdentifyObjectPermissionMetadataCommand',
      );
      this.hasRunOnce = true;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Rolling back IdentifyObjectPermissionMetadataCommand: ${error.message}`,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
