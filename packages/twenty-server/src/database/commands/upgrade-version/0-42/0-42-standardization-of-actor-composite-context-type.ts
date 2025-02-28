import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { FieldMetadataType } from 'twenty-shared';
import { IsNull, Repository } from 'typeorm';

import { CommandLogger } from 'src/database/commands/logger';
import { MigrationCommand } from 'src/database/commands/migration-command/decorators/migration-command.decorator';
import {
  MaintainedWorkspacesMigrationCommandOptions,
  MaintainedWorkspacesMigrationCommandRunner,
} from 'src/database/commands/migration-command/maintained-workspaces-migration-command.runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@MigrationCommand({
  name: 'standardization-of-actor-composite-context-type',
  description: 'Add context to actor composite type.',
  version: '0.42',
})
export class StandardizationOfActorCompositeContextTypeCommand extends MaintainedWorkspacesMigrationCommandRunner {
  protected readonly logger;

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);

    this.logger = new CommandLogger({
      constructorName: this.constructor.name,
      verbose: false,
    });
    this.logger.setVerbose(false);
  }

  async runMigrationCommandOnMaintainedWorkspaces(
    _passedParam: string[],
    options: MaintainedWorkspacesMigrationCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(`Running add-context-to-actor-composite-type command`);

    if (options?.dryRun) {
      this.logger.log(chalk.yellow('Dry run mode: No changes will be applied'));
    }

    for (const [index, workspaceId] of workspaceIds.entries()) {
      try {
        await this.runOnWorkspace(workspaceId, options?.dryRun);
        this.logger.verbose(
          `[${index + 1}/${workspaceIds.length}] Added for workspace: ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(`Error for workspace: ${workspaceId}`, error);
      }
    }
  }

  private async runOnWorkspace(
    workspaceId: string,
    dryRun = false,
  ): Promise<void> {
    this.logger.verbose(`Adding for workspace: ${workspaceId}`);
    const actorFields = await this.fieldMetadataRepository.find({
      where: {
        type: FieldMetadataType.ACTOR,
        workspaceId,
      },
      relations: ['object'],
    });

    for (const field of actorFields) {
      if (!field || !field.object) {
        this.logger.verbose(
          'field.objectMetadata is null',
          workspaceId,
          field.id,
        );
        continue;
      }

      const fieldRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          field.object.nameSingular,
        );

      if (!dryRun) {
        const rowsToUpdate = await fieldRepository.update(
          {
            [field.name + 'Context']: IsNull(),
          },
          {
            [field.name + 'Context']: {},
          },
        );

        this.logger.verbose(
          `updated ${rowsToUpdate ? rowsToUpdate.affected : 0} rows`,
        );
      }
    }

    if (!dryRun) {
      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );
    }

    await this.twentyORMGlobalManager.destroyDataSourceForWorkspace(
      workspaceId,
    );
  }
}
