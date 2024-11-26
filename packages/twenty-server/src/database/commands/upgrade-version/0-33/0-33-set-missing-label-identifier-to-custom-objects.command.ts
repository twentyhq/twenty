import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { IsNull, Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { CUSTOM_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

interface SetMissingLabelIdentifierToCustomObjectsCommandOptions
  extends ActiveWorkspacesCommandOptions {}

@Command({
  name: 'upgrade-0.33:set-missing-label-identifier-to-custom-objects',
  description: 'Set missing labelIdentifier to custom objects',
})
export class SetMissingLabelIdentifierToCustomObjectsCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: SetMissingLabelIdentifierToCustomObjectsCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log(
      'Running command to set missing labelIdentifier to custom objects',
    );

    for (const workspaceId of workspaceIds) {
      this.logger.log(`Running command for workspace ${workspaceId}`);

      try {
        await this.setMissingLabelIdentifierToCustomObjectsForWorkspace(
          workspaceId,
          options,
        );
      } catch (error) {
        this.logger.log(
          chalk.red(
            `Running command on workspace ${workspaceId} failed with error: ${error}, ${error.stack}`,
          ),
        );
        continue;
      } finally {
        this.logger.log(
          chalk.green(`Finished running command for workspace ${workspaceId}.`),
        );
      }
    }

    this.logger.log(chalk.green(`Command completed!`));
  }

  private async setMissingLabelIdentifierToCustomObjectsForWorkspace(
    workspaceId: string,
    options: SetMissingLabelIdentifierToCustomObjectsCommandOptions,
  ): Promise<void> {
    const customObjects = await this.objectMetadataRepository.find({
      where: {
        workspaceId,
        labelIdentifierFieldMetadataId: IsNull(),
        isCustom: true,
      },
    });

    for (const customObject of customObjects) {
      const labelIdentifierFieldMetadata =
        await this.fieldMetadataRepository.findOne({
          where: {
            workspaceId,
            objectMetadataId: customObject.id,
            standardId: CUSTOM_OBJECT_STANDARD_FIELD_IDS.name,
          },
        });

      if (labelIdentifierFieldMetadata && !options.dryRun) {
        await this.objectMetadataRepository.update(customObject.id, {
          labelIdentifierFieldMetadataId: labelIdentifierFieldMetadata.id,
        });
      }

      if (options.verbose) {
        this.logger.log(
          chalk.yellow(
            `Set labelIdentifierFieldMetadataId for custom object ${customObject.nameSingular}`,
          ),
        );
      }
    }
  }
}
