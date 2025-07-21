import { GraphQLResolveInfo } from 'graphql';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

export interface WorkspaceQueryBuilderOptions {
  objectMetadataItem: ObjectMetadataInterface;
  info: GraphQLResolveInfo;
  fieldMetadataCollection: FieldMetadataEntity[];
  objectMetadataCollection: ObjectMetadataInterface[];
  withSoftDeleted?: boolean;
}
