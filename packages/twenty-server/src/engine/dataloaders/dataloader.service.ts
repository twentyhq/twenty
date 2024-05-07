import { Injectable } from '@nestjs/common';

import DataLoader from 'dataloader';

import { IDataloaders } from 'src/engine/dataloaders/dataloader.interface';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';
import { RelationMetadataService } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.service';

@Injectable()
export class DataloaderService {
  constructor(
    private readonly relationMetadataService: RelationMetadataService,
  ) {}

  createLoaders(): IDataloaders {
    const relationMetadataLoader = new DataLoader<
      string,
      RelationMetadataEntity
    >(async (fieldMetadataIds: string[]) => {
      const relationsMetadataCollection =
        await this.relationMetadataService.findManyRelationMetadataByFieldMetadataIds(
          fieldMetadataIds,
        );

      return relationsMetadataCollection;
    });

    return {
      relationMetadataLoader,
    };
  }
}
