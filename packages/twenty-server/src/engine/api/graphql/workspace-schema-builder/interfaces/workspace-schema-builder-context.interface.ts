import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';
import { type ExternalFieldDrivers } from 'src/engine/twenty-orm/storage/external-field-drivers.token';

export interface WorkspaceSchemaBuilderContext {
  authContext: AuthContext;
  objectMetadataMaps: ObjectMetadataMaps;
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  externalFieldDrivers: ExternalFieldDrivers;
}
