import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export class ObjectMetadataItemNotFoundError extends Error {
  constructor(objectName: string, objectMetadataItems: ObjectMetadataItem[]) {
    const message = `Object metadata item "${objectName}" cannot be found in an array of ${
      objectMetadataItems?.length ?? 0
    } elements`;

    super(message);

    Object.setPrototypeOf(this, ObjectMetadataItemNotFoundError.prototype);
  }
}
