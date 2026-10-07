/* @license Enterprise */

import { MetadataReadability } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

// Records of an object open by default can depart from that default one by
// one; system objects stay out since nobody shares them from the product
export const isRecordShareExceptionObject = (
  flatObjectMetadata: Pick<FlatObjectMetadata, 'readability' | 'isSystem'>,
): boolean =>
  flatObjectMetadata.readability === MetadataReadability.OPEN &&
  !flatObjectMetadata.isSystem;
