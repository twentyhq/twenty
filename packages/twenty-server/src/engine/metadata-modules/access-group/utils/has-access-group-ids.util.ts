import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// These objects store the permissions themselves, so access groups never apply to their records
const OBJECT_UNIVERSAL_IDENTIFIERS_WITHOUT_ACCESS_GROUP_IDS: string[] = [
  STANDARD_OBJECTS.accessGroup.universalIdentifier,
  STANDARD_OBJECTS.recordShare.universalIdentifier,
];

export const hasAccessGroupIds = (
  objectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>,
): boolean =>
  !OBJECT_UNIVERSAL_IDENTIFIERS_WITHOUT_ACCESS_GROUP_IDS.includes(
    objectMetadata.universalIdentifier,
  );
