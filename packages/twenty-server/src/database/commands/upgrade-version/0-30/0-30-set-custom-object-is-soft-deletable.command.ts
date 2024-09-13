import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { In, Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

type SetCustomObjectIsSoftDeletableCommandOptions =
  ActiveWorkspacesCommandOptions;

@Command({
  name: 'upgrade-0.30:set-custom-object-is-soft-deletable',
  description: 'Set custom object is soft deletable',
})
export class SetCustomObjectIsSoftDeletableCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: SetCustomObjectIsSoftDeletableCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    const updateCriteria = {
      workspaceId: In(workspaceIds),
      isCustom: true,
      isSoftDeletable: false,
    };

    if (options.dryRun) {
      const objectsToUpdate = await this.objectMetadataRepository.find({
        select: ['id'],
        where: updateCriteria,
      });

      this.logger.log(
        `Dry run: ${objectsToUpdate.length} objects would be updated`,
      );

      return;
    }

    const result = await this.objectMetadataRepository.update(updateCriteria, {
      isSoftDeletable: true,
    });

    this.logger.log(`Updated ${result.affected} objects`);
  }
}
