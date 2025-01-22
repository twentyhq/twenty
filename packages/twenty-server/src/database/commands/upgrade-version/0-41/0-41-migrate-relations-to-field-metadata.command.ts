import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared';
import { Repository } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { isCommandLogger } from 'src/database/commands/logger';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import {
  deduceRelationDirection,
  RelationDirection,
} from 'src/engine/utils/deduce-relation-direction.util';

@Command({
  name: 'upgrade-0.41:migrate-relations-to-field-metadata',
  description: 'Migrate relations to field metadata',
})
export class MigrateRelationsToFieldMetadataCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: ActiveWorkspacesCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    this.logger.log('Running command to create many to one relations');

    if (isCommandLogger(this.logger)) {
      this.logger.setVerbose(options.verbose ?? false);
    }

    const workspacePromises = workspaceIds.map((workspaceId, index) =>
      this.processWorkspace(workspaceId, index, workspaceIds.length),
    );

    try {
      await Promise.all(workspacePromises);

      this.logger.log(chalk.green('Command completed!'));
    } catch (error) {
      this.logger.log(chalk.red('Error in workspace'));
    }
  }

  private async processWorkspace(
    workspaceId: string,
    index: number,
    total: number,
  ): Promise<void> {
    try {
      this.logger.log(
        `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
      );

      const fieldMetadataCollection = (await this.fieldMetadataRepository.find({
        where: { workspaceId, type: FieldMetadataType.RELATION },
        relations: ['fromRelationMetadata', 'toRelationMetadata'],
      })) as unknown as FieldMetadataEntity<FieldMetadataType.RELATION>[];

      if (!fieldMetadataCollection.length) {
        this.logger.log(
          chalk.yellow(
            `No relation field metadata found for workspace ${workspaceId}.`,
          ),
        );

        return;
      }

      const fieldMetadataToUpdateCollection = fieldMetadataCollection.map(
        (fieldMetadata) => this.mapFieldMetadata(fieldMetadata),
      );

      if (fieldMetadataToUpdateCollection.length > 0) {
        await this.fieldMetadataRepository.save(
          fieldMetadataToUpdateCollection,
        );
      }

      this.logger.log(
        chalk.green(`Command completed for workspace ${workspaceId}.`),
      );
    } catch {
      this.logger.log(chalk.red(`Error in workspace ${workspaceId}.`));
    }
  }

  private mapFieldMetadata(
    fieldMetadata: FieldMetadataEntity<FieldMetadataType.RELATION>,
  ): FieldMetadataEntity<FieldMetadataType.RELATION> {
    const relationMetadata =
      fieldMetadata.fromRelationMetadata ?? fieldMetadata.toRelationMetadata;

    const relationDirection = deduceRelationDirection(
      fieldMetadata,
      relationMetadata,
    );
    let relationType = relationMetadata.relationType as unknown as RelationType;

    if (
      relationDirection === RelationDirection.TO &&
      relationType === RelationType.ONE_TO_MANY
    ) {
      relationType = RelationType.MANY_TO_ONE;
    }

    const targetFieldMetadataId =
      relationDirection === RelationDirection.FROM
        ? relationMetadata.toFieldMetadataId
        : relationMetadata.fromFieldMetadataId;

    return {
      ...fieldMetadata,
      settings: {
        ...fieldMetadata.settings,
        relationType,
        onDelete: relationMetadata.onDeleteAction,
      },
      targetFieldMetadataId,
    };
  }
}
