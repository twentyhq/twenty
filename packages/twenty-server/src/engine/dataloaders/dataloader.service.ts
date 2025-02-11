import { Injectable } from '@nestjs/common';

import DataLoader from 'dataloader';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { FieldMetadataService } from 'src/engine/metadata-modules/field-metadata/field-metadata.service';
import { FieldMetadataRelationService } from 'src/engine/metadata-modules/field-metadata/relation/field-metadata-relation.service';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { RelationMetadataService } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.service';

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

@Injectable()
export class DataloaderService {
  constructor(
    private readonly relationMetadataService: RelationMetadataService,
    private readonly fieldMetadataRelationService: FieldMetadataRelationService,
    private readonly fieldMetadataService: FieldMetadataService,
  ) {}

  createLoaders(): IDataloaders {
    const relationMetadataLoader = this.createRelationMetadataLoader();
    const relationLoader = this.createRelationLoader();
    const fieldMetadataLoader = this.createFieldMetadataLoader();

    return {
      relationMetadataLoader,
      relationLoader,
      fieldMetadataLoader,
    };
  }

  private createRelationMetadataLoader() {
    return new DataLoader<
      RelationMetadataLoaderPayload,
      RelationMetadataEntity
    >(async (dataLoaderParams: RelationMetadataLoaderPayload[]) => {
      const workspaceId = dataLoaderParams[0].workspaceId;
      const fieldMetadataItems = dataLoaderParams.map(
        (dataLoaderParam) => dataLoaderParam.fieldMetadata,
      );

      const relationsMetadataCollection =
        await this.relationMetadataService.findManyRelationMetadataByFieldMetadataIds(
          fieldMetadataItems,
          workspaceId,
        );

      return relationsMetadataCollection;
    });
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

  private createFieldMetadataLoader() {
    return new DataLoader<FieldMetadataLoaderPayload, FieldMetadataEntity[]>(
      async (dataLoaderParams: FieldMetadataLoaderPayload[]) => {
        const workspaceId = dataLoaderParams[0].workspaceId;
        const objectMetadataItems = dataLoaderParams.map(
          (dataLoaderParam) => dataLoaderParam.objectMetadata,
        );

        const fieldMetadataCollection =
          await this.fieldMetadataService.getFieldMetadataItemsByBatch(
            objectMetadataItems.map((item) => item.id),
            workspaceId,
          );

        return fieldMetadataCollection;
      },
    );
  }
}
