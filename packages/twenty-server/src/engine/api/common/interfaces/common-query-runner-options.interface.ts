import { type AuthContext } from 'src/engine/core-modules/auth/types/auth-context.type';
import { type ObjectMetadataItemWithFieldMaps } from 'src/engine/metadata-modules/types/object-metadata-item-with-field-maps';
import { type ObjectMetadataMaps } from 'src/engine/metadata-modules/types/object-metadata-maps';

export interface CommonQueryRunnerOptions {
  authContext: AuthContext;
  objectMetadataItemWithFieldMaps: ObjectMetadataItemWithFieldMaps;
  objectMetadataMaps: ObjectMetadataMaps;
}
