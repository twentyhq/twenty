import DataLoader from 'dataloader';

import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

export interface IDataloaders {
  relationMetadataLoader: DataLoader<string, RelationMetadataEntity>;
}
