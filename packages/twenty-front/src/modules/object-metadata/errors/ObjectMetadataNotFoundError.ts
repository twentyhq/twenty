import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { doNotTranslate } from 'twenty-shared/i18n';

export class ObjectMetadataItemNotFoundError extends Error {
  constructor(
    objectName: string,
    objectMetadataItems: EnrichedObjectMetadataItem[],
  ) {
    const message = doNotTranslate(
      `Object metadata item "${objectName}" cannot be found in an array of ${
        objectMetadataItems?.length ?? 0
      } elements`,
    );

    super(message);

    Object.setPrototypeOf(this, ObjectMetadataItemNotFoundError.prototype);
  }
}
