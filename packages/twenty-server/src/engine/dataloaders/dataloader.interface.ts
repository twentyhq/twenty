import DataLoader from 'dataloader';

import {
  FieldMetadataLoaderPayload,
  RelationLoaderPayload,
  RelationMetadataLoaderPayload,
} from 'src/engine/dataloaders/dataloader.service';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

export interface IDataloaders {
  relationMetadataLoader: DataLoader<
    RelationMetadataLoaderPayload,
    RelationMetadataEntity
  >;

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
