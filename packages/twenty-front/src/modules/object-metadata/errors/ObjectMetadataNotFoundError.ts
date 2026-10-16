import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export class ObjectMetadataItemNotFoundError extends Error {
  constructor(
    objectName: string,
    objectMetadataItems: EnrichedObjectMetadataItem[],
  ) {
    // Diagnostic text is used for locale-independent issue grouping.
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    const message = `Object metadata item "${objectName}" cannot be found in an array of ${
      objectMetadataItems?.length ?? 0
    } elements`;

    super(message);

    Object.setPrototypeOf(this, ObjectMetadataItemNotFoundError.prototype);
  }
}
