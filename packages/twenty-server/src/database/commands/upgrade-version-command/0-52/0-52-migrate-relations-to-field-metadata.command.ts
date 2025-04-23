import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { In, Repository } from 'typeorm';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  RelationDirection,
  deduceRelationDirection,
} from 'src/engine/utils/deduce-relation-direction.util';
import { isFieldMetadataEntityOfType } from 'src/engine/utils/is-field-metadata-of-type.util';

@Command({
  name: 'upgrade:0-52:migrate-relations-to-field-metadata',
  description: 'Migrate relations to field metadata',
})
export class MigrateRelationsToFieldMetadataCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
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
  }: RunOnWorkspaceArgs): Promise<void> {
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
        isFieldMetadataEntityOfType(fieldMetadata, FieldMetadataType.UUID),
      // TODO: Fix this, it's working in other places but not here
    ) as FieldMetadataEntity<FieldMetadataType.UUID>[];

    const fieldMetadataToUpdateCollection = fieldMetadataCollection
      .filter((fieldMetadata) =>
        isFieldMetadataEntityOfType(fieldMetadata, FieldMetadataType.RELATION),
      )
      .map((fieldMetadata) =>
        this.updateRelationFieldMetadata(
          joinColumnFieldMetadataCollection,
          // TODO: Fix this, it's working in other places but not here
          fieldMetadata as FieldMetadataEntity<FieldMetadataType.RELATION>,
        ),
      );

    if (fieldMetadataToUpdateCollection.length > 0) {
      await this.fieldMetadataRepository.save(fieldMetadataToUpdateCollection);
    }

    this.logger.log(
      chalk.green(`Command completed for workspace ${workspaceId}.`),
    );
  }

  private updateRelationFieldMetadata(
    joinColumnFieldMetadataCollection: FieldMetadataEntity<FieldMetadataType.UUID>[],
    fieldMetadata: FieldMetadataEntity<FieldMetadataType.RELATION>,
  ): FieldMetadataEntity<FieldMetadataType.RELATION> {
    const relationMetadata =
      fieldMetadata.fromRelationMetadata ?? fieldMetadata.toRelationMetadata;
    const joinColumnFieldMetadata = joinColumnFieldMetadataCollection.find(
      (joinColumnFieldMetadata) =>
        // We're deducing the field based on the name of the relation field
        // This is not the best way to do this but we don't have a better way
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
