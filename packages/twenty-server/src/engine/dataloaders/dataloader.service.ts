import { Injectable } from '@nestjs/common';

import DataLoader from 'dataloader';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { FieldMetadataRelationService } from 'src/engine/metadata-modules/field-metadata/relation/field-metadata-relation.service';
import { IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataCacheService } from 'src/engine/metadata-modules/workspace-metadata-cache/services/workspace-metadata-cache.service';

export type RelationMetadataLoaderPayload = {
  workspaceId: string;
  fieldMetadata: Pick<
    FieldMetadataInterface,
    'type' | 'id' | 'objectMetadataId'
  >;
};

export type RelationLoaderPayload = {
  workspaceId: string;
  fieldMetadata: Pick<
    FieldMetadataInterface,
    | 'type'
    | 'id'
    | 'objectMetadataId'
    | 'relationTargetFieldMetadataId'
    | 'relationTargetObjectMetadataId'
  >;
};

export type FieldMetadataLoaderPayload = {
  workspaceId: string;
  objectMetadata: Pick<ObjectMetadataInterface, 'id'>;
};

export type IndexMetadataLoaderPayload = {
  workspaceId: string;
  objectMetadata: Pick<ObjectMetadataInterface, 'id'>;
};

@Injectable()
export class DataloaderService {
  constructor(
    private readonly fieldMetadataRelationService: FieldMetadataRelationService,
    private readonly fieldMetadataService: FieldMetadataService,
    private readonly workspaceMetadataCacheService: WorkspaceMetadataCacheService,
  ) {}

  createLoaders(): IDataloaders {
    const relationLoader = this.createRelationLoader();
    const fieldMetadataLoader = this.createFieldMetadataLoader();
    const indexMetadataLoader = this.createIndexMetadataLoader();

    return {
      relationLoader,
      fieldMetadataLoader,
      indexMetadataLoader,
    };
  }

  private createRelationLoader() {
    return new DataLoader<
      RelationLoaderPayload,
      {
        sourceObjectMetadata: ObjectMetadataEntity;
        targetObjectMetadata: ObjectMetadataEntity;
        sourceFieldMetadata: FieldMetadataEntity;
        targetFieldMetadata: FieldMetadataEntity;
      }
    >(async (dataLoaderParams: RelationLoaderPayload[]) => {
      const workspaceId = dataLoaderParams[0].workspaceId;
      const fieldMetadataItems = dataLoaderParams.map(
        (dataLoaderParam) => dataLoaderParam.fieldMetadata,
      );

      const fieldMetadataRelationCollection =
        await this.fieldMetadataRelationService.findCachedFieldMetadataRelation(
          fieldMetadataItems,
          workspaceId,
        );

      return fieldMetadataRelationCollection;
    });
  }

  private createIndexMetadataLoader() {
    return new DataLoader<IndexMetadataLoaderPayload, IndexMetadataDTO[]>(
      async (dataLoaderParams: IndexMetadataLoaderPayload[]) => {
        const workspaceId = dataLoaderParams[0].workspaceId;
        const objectMetadataIds = dataLoaderParams.map(
          (dataLoaderParam) => dataLoaderParam.objectMetadata.id,
        );

        const { objectMetadataMaps } =
          await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
            { workspaceId },
          );

        const indexMetadataCollection = objectMetadataIds.map((id) =>
          Object.values(objectMetadataMaps.byId[id].indexMetadatas).map(
            (indexMetadata) => {
              return {
                ...indexMetadata,
                createdAt: new Date(indexMetadata.createdAt),
                updatedAt: new Date(indexMetadata.updatedAt),
                id: indexMetadata.id,
                objectMetadataId: id,
                workspaceId: workspaceId,
              };
            },
          ),
        );

        return indexMetadataCollection;
      },
    );
  }

  private createFieldMetadataLoader() {
    return new DataLoader<FieldMetadataLoaderPayload, FieldMetadataDTO[]>(
      async (dataLoaderParams: FieldMetadataLoaderPayload[]) => {
        const workspaceId = dataLoaderParams[0].workspaceId;
        const objectMetadataIds = dataLoaderParams.map(
          (dataLoaderParam) => dataLoaderParam.objectMetadata.id,
        );

        const { objectMetadataMaps } =
          await this.workspaceMetadataCacheService.getExistingOrRecomputeMetadataMaps(
            { workspaceId },
          );

        const fieldMetadataCollection = objectMetadataIds.map((id) =>
          Object.values(objectMetadataMaps.byId[id].fieldsById).map(
            // TODO: fix this as we should merge FieldMetadataEntity and FieldMetadataInterface
            (fieldMetadata) => {
              return {
                ...fieldMetadata,
                createdAt: new Date(fieldMetadata.createdAt),
                updatedAt: new Date(fieldMetadata.updatedAt),
                workspaceId: workspaceId,
              };
            },
          ),
        );

        return fieldMetadataCollection;
      },
    );
  }
}
