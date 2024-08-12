import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';

export interface WorkspaceSchemaBuilderContext {
  authContext: AuthContext;
  objectMetadataItem: ObjectMetadataInterface;
  fieldMetadataCollection: FieldMetadataInterface[];
  objectMetadataCollection: ObjectMetadataInterface[];
}
