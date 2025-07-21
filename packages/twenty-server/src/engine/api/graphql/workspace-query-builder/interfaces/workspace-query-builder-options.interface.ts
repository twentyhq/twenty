import { GraphQLResolveInfo } from 'graphql';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';

import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

export interface WorkspaceQueryBuilderOptions {
  objectMetadataItem: ObjectMetadataInterface;
  info: GraphQLResolveInfo;
  fieldMetadataCollection: FieldMetadataEntity[];
  objectMetadataCollection: ObjectMetadataInterface[];
  withSoftDeleted?: boolean;
}
