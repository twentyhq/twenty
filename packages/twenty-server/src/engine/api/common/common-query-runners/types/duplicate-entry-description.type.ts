import { type MessageDescriptor } from '@lingui/core';

import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';

export type DuplicateEntryDescription = {
  userFriendlyMessage: MessageDescriptor;
  flatObjectMetadata: FlatObjectMetadata;
  duplicateColumn?: { name: string; value: string };
};
