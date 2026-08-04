import { type MetadataStoreItem } from '@/metadata-store/states/metadataStoreState';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

type ObjectMetadataItemNotFoundErrorContext = Pick<
  MetadataStoreItem,
  'status' | 'currentCollectionHash' | 'draftCollectionHash'
>;

export class ObjectMetadataItemNotFoundError extends Error {
  readonly objectNameSingular: string;
  readonly objectMetadataItemCount: number;
  readonly metadataStoreStatus: MetadataStoreItem['status'] | undefined;
  readonly currentCollectionHash: string | undefined;
  readonly draftCollectionHash: string | undefined;
  readonly isMetadataRefreshPending: boolean;

  constructor(
    objectName: string,
    objectMetadataItems: EnrichedObjectMetadataItem[],
    metadataStoreContext?: ObjectMetadataItemNotFoundErrorContext,
  ) {
    const objectMetadataItemCount = objectMetadataItems?.length ?? 0;
    const message = `Object metadata item "${objectName}" cannot be found in an array of ${objectMetadataItemCount} elements`;

    super(message);

    this.name = ObjectMetadataItemNotFoundError.name;
    this.objectNameSingular = objectName;
    this.objectMetadataItemCount = objectMetadataItemCount;
    this.metadataStoreStatus = metadataStoreContext?.status;
    this.currentCollectionHash = metadataStoreContext?.currentCollectionHash;
    this.draftCollectionHash = metadataStoreContext?.draftCollectionHash;
    this.isMetadataRefreshPending =
      metadataStoreContext?.status === 'draft-pending' ||
      metadataStoreContext?.currentCollectionHash !==
        metadataStoreContext?.draftCollectionHash;

    Object.setPrototypeOf(this, ObjectMetadataItemNotFoundError.prototype);
  }
}
