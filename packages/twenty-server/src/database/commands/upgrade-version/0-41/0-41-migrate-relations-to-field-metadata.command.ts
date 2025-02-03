import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared';
import { In, Repository } from 'typeorm';

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
import { isFieldMetadataOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

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

    try {
      for (const [index, workspaceId] of workspaceIds.entries()) {
        await this.processWorkspace(workspaceId, index, workspaceIds.length);
      }

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

      const fieldMetadataCollection = await this.fieldMetadataRepository.find({
        where: {
          workspaceId,
          type: In([FieldMetadataType.RELATION, FieldMetadataType.UUID]),
        },
        relations: ['fromRelationMetadata', 'toRelationMetadata'],
      });

      if (!fieldMetadataCollection.length) {
        this.logger.log(
          chalk.yellow(
            `No relation field metadata found for workspace ${workspaceId}.`,
          ),
        );

        return;
      }

      const joinColumnFieldMetadataCollection = fieldMetadataCollection.filter(
        (fieldMetadata) =>
          isFieldMetadataOfType(fieldMetadata, FieldMetadataType.UUID),
      ) as FieldMetadataEntity<FieldMetadataType.UUID>[];

      const fieldMetadataToUpdateCollection = fieldMetadataCollection
        .filter((fieldMetadata) =>
          isFieldMetadataOfType(fieldMetadata, FieldMetadataType.RELATION),
        )
        .map((fieldMetadata) =>
          this.updateRelationFieldMetadata(
            joinColumnFieldMetadataCollection,
            fieldMetadata,
          ),
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

  private updateRelationFieldMetadata(
    joinColumnFieldMetadataCollection: FieldMetadataEntity<FieldMetadataType.UUID>[],
    fieldMetadata: FieldMetadataEntity<FieldMetadataType.RELATION>,
  ): FieldMetadataEntity<FieldMetadataType.RELATION> {
    const relationMetadata =
      fieldMetadata.fromRelationMetadata ?? fieldMetadata.toRelationMetadata;
    const joinColumnFieldMetadata = joinColumnFieldMetadataCollection.find(
      (joinColumnFieldMetadata) =>
        joinColumnFieldMetadata.name === `${fieldMetadata.name}Id`,
    );

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

    const relationTargetFieldMetadataId =
      relationDirection === RelationDirection.FROM
        ? relationMetadata.toFieldMetadataId
        : relationMetadata.fromFieldMetadataId;

    const relationTargetObjectMetadataId =
      relationDirection === RelationDirection.FROM
        ? relationMetadata.toObjectMetadataId
        : relationMetadata.fromObjectMetadataId;

    return {
      ...fieldMetadata,
      settings: {
        relationType,
        onDelete: relationMetadata.onDeleteAction,
        joinColumnName: joinColumnFieldMetadata?.name,
      },
      relationTargetFieldMetadataId,
      relationTargetObjectMetadataId,
    };
  }
}
