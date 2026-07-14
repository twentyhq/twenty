import { type MetadataEntityStoreStatus } from '@/metadata-store/states/metadataStoreState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

export type ObjectMetadataItemNotFoundErrorContext = {
  currentCollectionSize: number;
  draftCollectionSize: number;
  status: MetadataEntityStoreStatus;
  currentCollectionHash?: string;
  draftCollectionHash?: string;
};

export class ObjectMetadataItemNotFoundError extends Error {
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
    this.context = context;

    Object.setPrototypeOf(this, ObjectMetadataItemNotFoundError.prototype);
  }
}
