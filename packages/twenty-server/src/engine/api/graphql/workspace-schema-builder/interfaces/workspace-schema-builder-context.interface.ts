import { AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export interface WorkspaceSchemaBuilderContext {
  authContext: AuthContext;
  objectMetadataMaps: ObjectMetadataMaps;
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
}
