/* @license Enterprise */

import { MetadataReadability } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// An inherited child that declares fields, such as a message of a thread, is
// discovered along with its parent. Its parent's gate still decides the rows.
export const isDiscoverableObject = (
  flatObjectMetadata: Pick<
    FlatObjectMetadata,
    'readability' | 'discoverableFieldUniversalIdentifiers'
  >,
): boolean =>
  flatObjectMetadata.readability === MetadataReadability.DISCOVERABLE ||
  (flatObjectMetadata.readability === MetadataReadability.INHERITED &&
    isNonEmptyArray(flatObjectMetadata.discoverableFieldUniversalIdentifiers));
