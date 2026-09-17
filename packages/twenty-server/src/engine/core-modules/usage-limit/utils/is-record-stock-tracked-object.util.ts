import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const isRecordStockTrackedObject = (
  flatObjectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>,
): boolean =>
  flatObjectMetadata.universalIdentifier !==
  STANDARD_OBJECTS.timelineActivity.universalIdentifier;
