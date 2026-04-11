import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { WorkspaceActivationStatus } from 'twenty-shared/workspace';
import { DataSource, QueryRunner, Repository } from 'typeorm';

import { CoreEntityCacheService } from 'src/engine/core-entity-cache/services/core-entity-cache.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UpgradeMigrationService } from 'src/engine/core-modules/upgrade/services/upgrade-migration.service';
import { UpgradeSequenceReaderService } from 'src/engine/core-modules/upgrade/services/upgrade-sequence-reader.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class WorkspaceActivationService {
  constructor(
    private readonly upgradeMigrationService: UpgradeMigrationService,
    private readonly upgradeSequenceReaderService: UpgradeSequenceReaderService,
    private readonly twentyConfigService: TwentyConfigService,
    private readonly coreEntityCacheService: CoreEntityCacheService,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {}

  async activateWorkspace({
    workspaceId,
    displayName,
  }: {
    workspaceId: string;
    displayName: string;
  }): Promise<WorkspaceEntity | null> {
    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.update(WorkspaceEntity, workspaceId, {
        displayName,
        activationStatus: WorkspaceActivationStatus.ACTIVE,
      });

      await this.initializeUpgradeStateInTransaction({
        workspaceId,
        queryRunner,
      });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    await this.coreEntityCacheService.invalidate(
      'workspaceEntity',
      workspaceId,
    );

    return await this.workspaceRepository.findOneBy({
      id: workspaceId,
    });
  }

  async initializeUpgradeStateInTransaction({
    workspaceId,
    queryRunner,
  }: {
    workspaceId: string;
    queryRunner: QueryRunner;
  }): Promise<void> {
    const lastWorkspaceCommand =
      this.upgradeSequenceReaderService.getLastWorkspaceCommand();

    const executedByVersion =
      this.twentyConfigService.get('APP_VERSION') ?? 'unknown';

    await this.upgradeMigrationService.markAsInitial({
      name: lastWorkspaceCommand.name,
      workspaceId,
      executedByVersion,
      queryRunner,
    });
  }
}
