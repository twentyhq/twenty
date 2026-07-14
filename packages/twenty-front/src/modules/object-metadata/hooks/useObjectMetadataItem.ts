import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { ObjectMetadataItemNotFoundError } from '@/object-metadata/errors/ObjectMetadataNotFoundError';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

import { isDefined } from 'twenty-shared/utils';
import { type ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';

export const useObjectMetadataItem = ({
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
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
  const objectMetadataStore = useAtomFamilyStateValue(
    metadataStoreState,
    'objectMetadataItems',
  );
  const objectMetadataItems = objectMetadataItemsWithFields;

  if (!isDefined(objectMetadataItem)) {
    throw new ObjectMetadataItemNotFoundError(
      objectNameSingular,
      objectMetadataItems,
      {
        currentCollectionSize: objectMetadataStore.current.length,
        draftCollectionSize: objectMetadataStore.draft.length,
        status: objectMetadataStore.status,
        currentCollectionHash: objectMetadataStore.currentCollectionHash,
        draftCollectionHash: objectMetadataStore.draftCollectionHash,
      },
    );
  }

  return {
    objectMetadataItem,
  };
};
