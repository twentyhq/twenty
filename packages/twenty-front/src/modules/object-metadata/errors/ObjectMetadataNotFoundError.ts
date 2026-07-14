import { type MetadataEntityStoreStatus } from '@/metadata-store/states/metadataStoreState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export type ObjectMetadataItemNotFoundErrorContext = {
  layoutVersion: number;
  metadataCollectionHash?: string;
  metadataLoadedVersion: number;
  metadataStoreStatus: MetadataEntityStoreStatus;
  objectCount: number;
  objectNameCategory: 'custom' | 'standard' | 'unknown';
};

export class ObjectMetadataItemNotFoundError extends Error {
  readonly objectName: string;
  readonly context: ObjectMetadataItemNotFoundErrorContext;

  constructor(
    objectName: string,
    objectMetadataItems: EnrichedObjectMetadataItem[],
    context: ObjectMetadataItemNotFoundErrorContext,
  ) {
    const message = `Object metadata item "${objectName}" cannot be found in an array of ${
      objectMetadataItems?.length ?? 0
    } elements`;

    super(message);

    this.name = 'ObjectMetadataItemNotFoundError';
    this.objectName = objectName;
    this.context = context;

    Object.setPrototypeOf(this, ObjectMetadataItemNotFoundError.prototype);
  }
}
