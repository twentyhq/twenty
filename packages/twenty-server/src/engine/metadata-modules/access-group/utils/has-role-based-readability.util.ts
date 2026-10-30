import { MetadataReadability } from 'twenty-shared/types';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export const hasRoleBasedReadability = (
  objectMetadata: Pick<FlatObjectMetadata, 'readability'>,
): boolean =>
  objectMetadata.readability !== MetadataReadability.SYSTEM &&
  objectMetadata.readability !== MetadataReadability.APPLICATION;
