import DataLoader from 'dataloader';

import {
  FieldMetadataLoaderPayload,
  IndexFieldMetadataLoaderPayload,
  IndexMetadataLoaderPayload,
  MorphRelationLoaderPayload,
  RelationLoaderPayload,
} from 'src/engine/dataloaders/dataloader.service';
import { FieldMetadataDTO } from 'src/engine/metadata-modules/field-metadata/dtos/field-metadata.dto';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { IndexFieldMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-field-metadata.dto';
import { IndexMetadataDTO } from 'src/engine/metadata-modules/index-metadata/dtos/index-metadata.dto';
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
}
