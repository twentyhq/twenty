import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { IsNull, Not, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { computeMetadataNameFromLabel } from 'src/engine/metadata-modules/utils/validate-name-and-label-are-sync-or-throw.util';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:1-1:fix-update-standard-fields-is-label-synced-with-name',
  description:
    'Fix isLabelSyncedWithName property for standard fields to match actual label-name synchronization state',
})
export class FixUpdateStandardFieldsIsLabelSyncedWithName extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
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
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(`Updating standard fields for workspace ${workspaceId}`);
    const workspaceStandardFields = await this.fieldMetadataRepository.find({
      where: {
        workspaceId,
        isCustom: false,
        standardId: Not(IsNull()),
      },
    });

    let updatedFields = 0;

    for (const field of workspaceStandardFields) {
      const isLabelSyncedWithName =
        computeMetadataNameFromLabel(field.label) === field.name;

      if (field.isLabelSyncedWithName === isLabelSyncedWithName) {
        continue;
      }

      if (!options.dryRun) {
        await this.fieldMetadataRepository.update(field.id, {
          isLabelSyncedWithName,
        });
      }
      updatedFields++;
      this.logger.log(`Updated isLabelSyncedMetadata for field ${field.id}`);
    }

    if (!options.dryRun && updatedFields > 0) {
      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );
    }
    this.logger.log(
      `Updated ${updatedFields} field.s for workspace ${workspaceId}`,
    );
  }
}
