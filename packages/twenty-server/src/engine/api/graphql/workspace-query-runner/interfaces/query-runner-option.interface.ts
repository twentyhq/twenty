import { GraphQLResolveInfo } from 'graphql';

import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

export interface WorkspaceQueryRunnerOptions {
  workspaceId: string;
  userId: string | undefined;
  info: GraphQLResolveInfo;
  objectMetadataItem: ObjectMetadataInterface;
  fieldMetadataCollection: FieldMetadataInterface[];
  objectMetadataCollection: ObjectMetadataInterface[];
}
