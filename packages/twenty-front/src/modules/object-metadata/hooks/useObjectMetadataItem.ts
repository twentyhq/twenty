import { ObjectMetadataItemNotFoundError } from '@/object-metadata/errors/ObjectMetadataNotFoundError';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsWithFieldsSelector } from '@/object-metadata/states/objectMetadataItemsWithFieldsSelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
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

  const objectMetadataItems = useAtomStateValue(
    objectMetadataItemsWithFieldsSelector,
  );

  if (!isDefined(objectMetadataItem)) {
    throw new ObjectMetadataItemNotFoundError(
      objectNameSingular,
      objectMetadataItems,
    );
  }

  return {
    objectMetadataItem,
  };
};
