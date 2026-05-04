import { Injectable } from '@nestjs/common';

import {
  FieldMetadataType,
  RelationOnDeleteAction,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { GlobalWorkspaceDataSource } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource';

type RelationSettings = {
  relationType?: string;
  onDelete?: string;
  joinColumnName?: string | null;
};

@Injectable()
export class RelationOnDeleteService {
  async nullifyForeignKeysOnSoftDelete({
    deletedRecordIds,
    deletedObjectMetadata,
    flatFieldMetadataMaps,
    flatObjectMetadataMaps,
    workspaceDataSource,
  }: {
    deletedRecordIds: string[];
    deletedObjectMetadata: FlatObjectMetadata;
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    workspaceDataSource: GlobalWorkspaceDataSource;
  }): Promise<void> {
    if (deletedRecordIds.length === 0) {
      return;
    }

    const incomingSetNullFields = this.findIncomingSetNullRelations(
      deletedObjectMetadata,
      flatFieldMetadataMaps,
    );

    const nullifyTasks = incomingSetNullFields.map((field) =>
      this.nullifyForeignKeyColumn({
        field,
        deletedRecordIds,
        flatObjectMetadataMaps,
        workspaceDataSource,
      }),
    );

    await Promise.all(nullifyTasks);
  }

  private findIncomingSetNullRelations(
    deletedObjectMetadata: FlatObjectMetadata,
    flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata>,
  ): FlatFieldMetadata[] {
    return Object.values(flatFieldMetadataMaps.byUniversalIdentifier)
      .filter(isDefined)
      .filter((field) => {
        if (field.type !== FieldMetadataType.RELATION) {
          return false;
        }

        if (field.relationTargetObjectMetadataId !== deletedObjectMetadata.id) {
          return false;
        }

        const settings = field.settings as unknown as
          | RelationSettings
          | undefined;

        return (
          settings?.relationType === RelationType.MANY_TO_ONE &&
          settings?.onDelete === RelationOnDeleteAction.SET_NULL
        );
      });
  }

  private async nullifyForeignKeyColumn({
    field,
    deletedRecordIds,
    flatObjectMetadataMaps,
    workspaceDataSource,
  }: {
    field: FlatFieldMetadata;
    deletedRecordIds: string[];
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    workspaceDataSource: GlobalWorkspaceDataSource;
  }): Promise<void> {
    const referencingObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: field.objectMetadataId,
      flatEntityMaps: flatObjectMetadataMaps,
    });

    if (!referencingObjectMetadata) {
      return;
    }

    const settings = field.settings as unknown as
      | RelationSettings
      | undefined;

    const joinColumnName = settings?.joinColumnName ?? `${field.name}Id`;

    const repository = workspaceDataSource.getRepository(
      referencingObjectMetadata.nameSingular,
    );

    await repository
      .createQueryBuilder(referencingObjectMetadata.nameSingular)
      .update()
      .set({ [joinColumnName]: null } as Record<string, null>)
      .where(`"${joinColumnName}" IN (:...ids)`, { ids: deletedRecordIds })
      .execute();
  }
}
