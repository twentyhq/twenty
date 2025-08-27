import type DataLoader from 'dataloader';

import {
  type FieldMetadataLoaderPayload,
  type IndexFieldMetadataLoaderPayload,
  type IndexMetadataLoaderPayload,
  type MorphRelationLoaderPayload,
  type ObjectMetadataLoaderPayload,
  type RelationLoaderPayload,
} from 'src/engine/dataloaders/dataloader.service';
import { type FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { type FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { type IndexFieldMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-field-metadata.dto';
import { type IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
import { type ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';

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

  morphRelationLoader: DataLoader<
    MorphRelationLoaderPayload,
    {
      sourceObjectMetadata: ObjectMetadataEntity;
      targetObjectMetadata: ObjectMetadataEntity;
      sourceFieldMetadata: FieldMetadataEntity;
      targetFieldMetadata: FieldMetadataEntity;
    }[]
  >;

  fieldMetadataLoader: DataLoader<
    FieldMetadataLoaderPayload,
    FieldMetadataDTO[]
  >;

  indexMetadataLoader: DataLoader<
    IndexMetadataLoaderPayload,
    IndexMetadataDTO[]
  >;

  indexFieldMetadataLoader: DataLoader<
    IndexFieldMetadataLoaderPayload,
    IndexFieldMetadataDTO[]
  >;

  objectMetadataLoader: DataLoader<
    ObjectMetadataLoaderPayload,
    ObjectMetadataItemWithFieldMaps | null
  >;
}
