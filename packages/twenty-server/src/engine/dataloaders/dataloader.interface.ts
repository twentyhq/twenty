import DataLoader from 'dataloader';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import {
  RelationLoaderPayload,
  RelationMetadataLoaderPayload,
} from 'src/engine/dataloaders/dataloader.service';
import { RelationMetadataEntity } from 'src/engine/metadata-modules/relation-metadata/relation-metadata.entity';

export interface IDataloaders {
  relationMetadataLoader: DataLoader<
    RelationMetadataLoaderPayload,
    RelationMetadataEntity
  >;

  relationLoader: DataLoader<
    RelationLoaderPayload,
    {
      sourceObjectMetadata: ObjectMetadataInterface;
      targetObjectMetadata: ObjectMetadataInterface;
      sourceFieldMetadata: FieldMetadataInterface;
      targetFieldMetadata: FieldMetadataInterface;
    }
  >;
}
