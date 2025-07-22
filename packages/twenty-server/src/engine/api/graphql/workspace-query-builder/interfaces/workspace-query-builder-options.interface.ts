import { GraphQLResolveInfo } from 'graphql';

import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

export interface WorkspaceQueryBuilderOptions {
  objectMetadataItem: ObjectMetadataEntity;
  info: GraphQLResolveInfo;
  fieldMetadataCollection: FieldMetadataEntity[];
  objectMetadataCollection: ObjectMetadataEntity[];
  withSoftDeleted?: boolean;
}
