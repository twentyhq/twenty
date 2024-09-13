import { Injectable } from '@nestjs/common';

import DataLoader from 'dataloader';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';

import { IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { RelationMetadataService } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.service';

export type RelationMetadataLoaderPayload = {
  workspaceId: string;
  fieldMetadata: Pick<
    FieldMetadataInterface,
    'type' | 'id' | 'objectMetadataId'
  >;
};

@Injectable()
export class DataloaderService {
  constructor(
    private readonly relationMetadataService: RelationMetadataService,
  ) {}

  createLoaders(): IDataloaders {
    const relationMetadataLoader = new DataLoader<
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

    return {
      relationMetadataLoader,
    };
  }
}
