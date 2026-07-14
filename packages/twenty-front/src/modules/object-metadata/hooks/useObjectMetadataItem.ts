import { ObjectMetadataItemNotFoundError } from '@/object-metadata/errors/ObjectMetadataNotFoundError';
import { metadataLoadedVersionState } from '@/metadata-store/states/metadataLoadedVersionState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useStore } from 'jotai';

import { type ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { isDefined } from 'twenty-shared/utils';

export const useObjectMetadataItem = ({
  layoutVersion,
  objectNameCategory,
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const store = useStore();
  const objectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: objectNameSingular,
      objectNameType: 'singular',
    },
  );

  const objectMetadataItemsWithFields = useAtomStateValue(
    objectMetadataItemsWithFieldsSelector,
  );
  const objectMetadataItems = objectMetadataItemsWithFields;

  if (!isDefined(objectMetadataItem)) {
    const metadataStoreEntry = store.get(
      metadataStoreState.atomFamily('objectMetadataItems'),
    );
    const metadataLoadedVersion = store.get(metadataLoadedVersionState.atom);

    throw new ObjectMetadataItemNotFoundError(
      objectNameSingular,
      objectMetadataItems,
      {
        layoutVersion: layoutVersion ?? metadataLoadedVersion,
        metadataCollectionHash: metadataStoreEntry.currentCollectionHash,
        metadataLoadedVersion,
        metadataStoreStatus: metadataStoreEntry.status,
        objectCount: metadataStoreEntry.current.length,
        objectNameCategory: objectNameCategory ?? 'unknown',
      },
    );
  }

  return {
    objectMetadataItem,
  };
};
