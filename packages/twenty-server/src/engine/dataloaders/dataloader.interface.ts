import DataLoader from 'dataloader';

import {
  FieldMetadataLoaderPayload,
  RelationLoaderPayload,
} from 'src/engine/dataloaders/dataloader.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export interface IDataloaders {
  relationLoader: DataLoader<
    RelationLoaderPayload,
    {
      sourceObjectMetadata: ObjectMetadataEntity;
      targetObjectMetadata: ObjectMetadataEntity;
      sourceFieldMetadata: FieldMetadataEntity;
      targetFieldMetadata: FieldMetadataEntity;
    }
  >;

  fieldMetadataLoader: DataLoader<
    FieldMetadataLoaderPayload,
    FieldMetadataEntity[]
  >;
}
