import { type MinimalMetadata } from '@/metadata-store/types/MinimalMetadata';

export const getViewFamilyHintFromCollectionHashes = (
  collectionHashes: MinimalMetadata['collectionHashes'] | undefined,
): string | undefined =>
  collectionHashes?.find(({ collectionName }) => collectionName === 'view')
    ?.hash;
