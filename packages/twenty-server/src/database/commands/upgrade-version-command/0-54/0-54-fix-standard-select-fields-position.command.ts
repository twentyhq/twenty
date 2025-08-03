import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { TASK_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

@Command({
  name: 'upgrade:0-54:fix-standard-select-fields-position',
  description: 'Fix standard select fields position',
})
export class FixStandardSelectFieldsPositionCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(FieldMetadataEntity, 'core')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    await this.overrideTaskStatusFieldMetadataPosition({
      workspaceId,
      dryRun: options.dryRun,
    });
  }

  private async overrideTaskStatusFieldMetadataPosition({
    workspaceId,
    dryRun,
  }: {
    workspaceId: string;
    dryRun: boolean | undefined;
  }) {
    const taskStatusFieldMetadata = await this.fieldMetadataRepository.findOne({
      where: {
        workspaceId,
        standardId: TASK_STANDARD_FIELD_IDS.status,
      },
    });

    if (!taskStatusFieldMetadata) {
      this.logger.warn(
        `Task status field metadata not found for workspace ${workspaceId}. Exiting.`,
      );

      return;
    }

    const scannedPositions = new Set<number>();
    let biggestPosition = -1;

    // Sort options by position for consistent processing
    const sortedOptions = (taskStatusFieldMetadata.options ?? []).sort(
      (a, b) => a.position - b.position,
    );

    for (const option of sortedOptions) {
      if (scannedPositions.has(option.position)) {
        this.logger.warn(
          `Found duplicate position ${option.position} for option ${option.value} in task status field metadata for workspace ${workspaceId}.`,
        );

        option.position = biggestPosition + 1;
      }

      biggestPosition = Math.max(biggestPosition, option.position);
      scannedPositions.add(option.position);
    }

    if (!dryRun) {
      await this.fieldMetadataRepository.update(
        {
          workspaceId,
          standardId: TASK_STANDARD_FIELD_IDS.status,
        },
        {
          options: sortedOptions,
        },
      );

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );
    }
  }
}
