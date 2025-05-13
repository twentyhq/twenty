import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { In, Like, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

@Command({
  name: 'upgrade:0-53:remove-relation-foreign-key-field-metadata',
  description: 'Remove relation foreign key from field metadata',
})
export class RemoveRelationForeignKeyFieldMetadataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly featureFlagService: FeatureFlagService,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
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

    const fieldMetadataCollection = await this.fieldMetadataRepository.find({
      where: {
        workspaceId,
        type: In([FieldMetadataType.UUID]),
        label: Like('%(foreign key)%'),
      },
    });

    if (!fieldMetadataCollection.length) {
      this.logger.log(
        chalk.yellow(
          `No relation field metadata found for workspace ${workspaceId}.`,
        ),
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        chalk.yellow(
          `Dry run, would delete ${fieldMetadataCollection.length} relation field metadata for workspace ${workspaceId}.`,
        ),
      );
    } else {
      await this.featureFlagService.enableFeatureFlags(
        ['IS_NEW_RELATION_ENABLED' as FeatureFlagKey],
        workspaceId,
      );
      await this.fieldMetadataRepository.delete({
        id: In(
          fieldMetadataCollection.map((fieldMetadata) => fieldMetadata.id),
        ),
      });
    }

    this.logger.log(
      chalk.green(`Command completed for workspace ${workspaceId}.`),
    );
  }
}
