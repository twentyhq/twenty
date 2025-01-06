import { InjectRepository } from '@nestjs/typeorm';

import chalk from 'chalk';
import { Command } from 'nest-commander';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { isCommandLogger } from 'src/database/commands/logger';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  RelationMetadataEntity,
  RelationMetadataType,
} from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

@Command({
  name: 'upgrade-0.41:create-many-to-one-relations',
  description: 'Create many to one relations',
})
export class CreateManyToOneRelationsCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(RelationMetadataEntity, 'metadata')
    private readonly relationMetadataRepository: Repository<RelationMetadataEntity>,
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

    await Promise.all(
      workspaceIds.map(async (workspaceId, index) => {
        try {
          this.logger.log(
            `Running command for workspace ${workspaceId} ${index + 1}/${workspaceIds.length}`,
          );

          const relationMetadataCollection =
            await this.relationMetadataRepository.find({
              where: { workspaceId },
              relations: ['fromObjectMetadata', 'toObjectMetadata'],
            });

          const relationMetadataToCreateCollection = relationMetadataCollection
            .filter(
              (relationMetadata) =>
                relationMetadata.relationType ===
                RelationMetadataType.ONE_TO_MANY,
            )
            .map((relationMetadata) =>
              this.relationMetadataRepository.create({
                ...relationMetadata,
                id: uuidv4(),
                fromObjectMetadataId: relationMetadata.toObjectMetadataId,
                toObjectMetadataId: relationMetadata.fromObjectMetadataId,
                fromFieldMetadataId: relationMetadata.toFieldMetadataId,
                toFieldMetadataId: relationMetadata.fromFieldMetadataId,
                relationType: RelationMetadataType.MANY_TO_ONE,
              }),
            )
            .filter(
              (newRelationMetadata) =>
                !relationMetadataCollection.some(
                  (relation) =>
                    relation.fromObjectMetadataId ===
                      newRelationMetadata.fromObjectMetadataId &&
                    relation.toObjectMetadataId ===
                      newRelationMetadata.toObjectMetadataId &&
                    relation.fromFieldMetadataId ===
                      newRelationMetadata.fromFieldMetadataId &&
                    relation.toFieldMetadataId ===
                      newRelationMetadata.toFieldMetadataId &&
                    relation.relationType === newRelationMetadata.relationType,
                ),
            );

          if (relationMetadataToCreateCollection.length > 0) {
            await this.relationMetadataRepository.save(
              relationMetadataToCreateCollection,
            );
          }

          this.logger.log(
            chalk.green(`Command completed for workspace ${workspaceId}.`),
          );
        } catch {
          this.logger.log(chalk.red(`Error in workspace ${workspaceId}.`));
        }
      }),
    );

    this.logger.log(chalk.green('Command completed!'));
  }
}
