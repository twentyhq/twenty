import { GraphQLResolveInfo } from 'graphql';

import { FieldMetadataInterface } from 'src/engine-metadata/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine-metadata/field-metadata/interfaces/object-metadata.interface';

export interface WorkspaceQueryBuilderOptions {
  objectMetadataItem: ObjectMetadataInterface;
  info: GraphQLResolveInfo;
  fieldMetadataCollection: FieldMetadataInterface[];
  objectMetadataCollection: ObjectMetadataInterface[];
}
