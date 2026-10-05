import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Timeline history grows with every update, so expanding it per record turns one page into thousands of rows
export const isRelationTargetExcludedFromSelection = (
  relationTargetObjectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>,
): boolean =>
  relationTargetObjectMetadata.universalIdentifier ===
  STANDARD_OBJECTS.timelineActivity.universalIdentifier;
