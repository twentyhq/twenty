/* @license Enterprise */

import { OPEN_WHEN_DETACHED_OBJECT_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/record-share/constants/open-when-detached-object-universal-identifiers.constant';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const isOpenWhenDetachedObject = (
  flatObjectMetadata: Pick<FlatObjectMetadata, 'universalIdentifier'>,
): boolean =>
  OPEN_WHEN_DETACHED_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
    flatObjectMetadata.universalIdentifier,
  );
