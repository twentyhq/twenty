import DataLoader from 'dataloader';

import { RelationMetadataLoaderPayload } from 'src/engine/dataloaders/dataloader.service';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

export interface IDataloaders {
  relationMetadataLoader: DataLoader<
    RelationMetadataLoaderPayload,
    RelationMetadataEntity
  >;
}
