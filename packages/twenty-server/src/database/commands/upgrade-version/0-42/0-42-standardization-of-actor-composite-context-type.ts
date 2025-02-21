import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared';
import { IsNull, Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { CommandLogger } from 'src/database/commands/logger';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade-0.42:standardization-of-actor-composite-context-type',
  description: 'Add context to actor composite type.',
})
export class StandardizationOfActorCompositeContextTypeCommand extends ActiveWorkspacesCommandRunner {
  protected readonly logger;

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository);
    this.logger = new CommandLogger({
      constructorName: this.constructor.name,
      verbose: false,
    });
    this.logger.setVerbose(false);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: ActiveWorkspacesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(`Running add-context-to-actor-composite-type command`);

    if (options?.dryRun) {
      this.logger.log(chalk.yellow('Dry run mode: No changes will be applied'));
    }

    for (const [index, workspaceId] of workspaceIds.entries()) {
      try {
        await this.execute(workspaceId, options?.dryRun);
        this.logger.verbose(
          `[${index + 1}/${workspaceIds.length}] Added for workspace: ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(`Error for workspace: ${workspaceId}`, error);
      }
    }
  }

  private async execute(workspaceId: string, dryRun = false): Promise<void> {
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
