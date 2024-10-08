import { FieldMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/field-metadata.interface';
import { ObjectMetadataInterface } from 'src/engine/metadata-modules/field-metadata/interfaces/object-metadata.interface';

import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import {
  ObjectMetadataMap,
  ObjectMetadataMapItem,
} from 'src/engine/metadata-modules/utils/generate-object-metadata-map.util';

export interface WorkspaceSchemaBuilderContext {
  authContext: AuthContext;
  fieldMetadataCollection: FieldMetadataInterface[];
  objectMetadataCollection: ObjectMetadataInterface[];
  objectMetadataItem: ObjectMetadataInterface;
  objectMetadataMap: ObjectMetadataMap;
  objectMetadataMapItem: ObjectMetadataMapItem;
}
