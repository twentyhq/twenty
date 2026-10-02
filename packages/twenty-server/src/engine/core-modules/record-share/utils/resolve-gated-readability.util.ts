/* @license Enterprise */

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { MetadataReadability } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Email and calendar lost their visibility hooks in 2.46. Until a workspace's
// upgrade makes them discoverable they stay private rather than open. Remove
// once 2.46 leaves the cross-upgrade window.
const OBJECT_UNIVERSAL_IDENTIFIERS_PRIVATE_UNTIL_UPGRADED = new Set<string>([
  STANDARD_OBJECTS.messageThread.universalIdentifier,
  STANDARD_OBJECTS.message.universalIdentifier,
  STANDARD_OBJECTS.calendarEvent.universalIdentifier,
]);

export const resolveGatedReadability = (
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'readability' | 'universalIdentifier'
  >,
): MetadataReadability =>
  flatObjectMetadata.readability === MetadataReadability.OPEN &&
  OBJECT_UNIVERSAL_IDENTIFIERS_PRIVATE_UNTIL_UPGRADED.has(
    flatObjectMetadata.universalIdentifier,
  )
    ? MetadataReadability.PRIVATE
    : flatObjectMetadata.readability;
