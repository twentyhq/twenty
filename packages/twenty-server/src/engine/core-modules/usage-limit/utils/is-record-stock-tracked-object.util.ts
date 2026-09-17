import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Timeline activities are written by the platform on every record event, so
// counting them would let the workspace's own history fill its record stock.
export const isRecordStockTrackedObject = (
  flatObjectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>,
): boolean =>
  flatObjectMetadata.universalIdentifier !==
  STANDARD_OBJECTS.timelineActivity.universalIdentifier;
