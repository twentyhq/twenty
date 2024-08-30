import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { In, Repository } from 'typeorm';

import {
  ActiveWorkspacesCommandOptions,
  ActiveWorkspacesCommandRunner,
} from 'src/database/commands/active-workspaces.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  FieldMetadataEntity,
  FieldMetadataType,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { BASE_OBJECT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

type SetCustomObjectIsSoftDeletableCommandOptions =
  ActiveWorkspacesCommandOptions;

@Command({
  name: 'upgrade-0.24:set-custom-object-is-soft-deletable',
  description: 'Set custom object is soft deletable',
})
export class SetCustomObjectIsSoftDeletableCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ObjectMetadataEntity, 'metadata')
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectRepository(FieldMetadataEntity, 'metadata')
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    _passedParam: string[],
    options: SetCustomObjectIsSoftDeletableCommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    for (const workspaceId of workspaceIds) {
      await this.updateCustomObjectMetadata(
        workspaceId,
        options.dryRun ?? false,
      );
      await this.createDeletedAtFields(workspaceId, options.dryRun ?? false);
    }
  }

  private async updateCustomObjectMetadata(
    workspaceId: string,
    dryRun: boolean,
  ): Promise<void> {
    const updateCriteria = {
      workspaceId: workspaceId,
      isCustom: true,
      isSoftDeletable: false,
    };

    const objectsMetadataToUpdateIds = (
      await this.objectMetadataRepository.find({
        select: ['id'],
        where: updateCriteria,
      })
    ).map((entity) => entity.id);

    if (dryRun) {
      this.logger.log(
        `Dry run: ${objectsMetadataToUpdateIds.length} objects would be updated for workspace ${workspaceId}`,
      );

      return;
    }

    if (objectsMetadataToUpdateIds.length === 0) {
      this.logger.log(
        `No objects found for workspace ${workspaceId} to update`,
      );

      return;
    }

    const updatedObjects = await this.objectMetadataRepository.update(
      objectsMetadataToUpdateIds,
      {
        isSoftDeletable: true,
      },
    );

    this.logger.log(
      `Updated ${updatedObjects.affected} objects for workspace ${workspaceId}`,
    );
  }

  private async createDeletedAtFields(workspaceId: string, dryRun: boolean) {
    const customObjectsMetadata = await this.objectMetadataRepository.find({
      select: ['id'],
      where: {
        workspaceId,
        isCustom: true,
      },
    });

    const customObjectsMetadataIds = customObjectsMetadata.map(
      (entity) => entity.id,
    );

    if (dryRun) {
      this.logger.log(
        `Dry run: ${customObjectsMetadataIds.length} deletedAt fields would be created for workspace ${workspaceId}`,
      );

      return;
    }

    const existingDeletedAtFields = await this.fieldMetadataRepository.find({
      select: ['objectMetadataId'],
      where: {
        workspaceId,
        objectMetadataId: In(customObjectsMetadataIds),
        standardId: BASE_OBJECT_STANDARD_FIELD_IDS.deletedAt,
      },
    });

    const existingDeletedAtFieldObjectIds = new Set(
      existingDeletedAtFields.map((field) => field.objectMetadataId),
    );

    const objectsNeedingDeletedAtFields = customObjectsMetadataIds.filter(
      (id) => !existingDeletedAtFieldObjectIds.has(id),
    );

    const newDeletedAtFields = objectsNeedingDeletedAtFields.map(
      (objectId) =>
        ({
          standardId: BASE_OBJECT_STANDARD_FIELD_IDS.deletedAt,
          type: FieldMetadataType.DATE_TIME,
          name: 'deletedAt',
          label: 'Deleted at',
          icon: 'IconCalendarClock',
          description: 'Deletion date',
          isNullable: true,
          isActive: true,
          isCustom: false,
          isSystem: false,
          workspaceId,
          defaultValue: null,
          objectMetadataId: objectId,
        }) satisfies Partial<FieldMetadataEntity>,
    );

    if (newDeletedAtFields.length > 0) {
      const createdDeletedAtFields =
        await this.fieldMetadataRepository.insert(newDeletedAtFields);

      this.logger.log(
        `Created ${createdDeletedAtFields.identifiers.length} deletedAt fields for workspace ${workspaceId}`,
      );
    } else {
      this.logger.log(
        `No new deletedAt fields needed for workspace ${workspaceId}`,
      );
    }
  }
}
