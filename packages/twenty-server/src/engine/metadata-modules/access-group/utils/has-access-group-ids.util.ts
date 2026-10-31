import { PERMISSION_STORAGE_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/metadata-modules/access-group/constants/permission-storage-object-universal-identifiers.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const hasAccessGroupIds = (
  objectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>,
): boolean =>
  !PERMISSION_STORAGE_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
    objectMetadata.universalIdentifier,
  );
