import { useRecoilValue } from 'recoil';

import { ObjectMetadataItemNotFoundError } from '@/object-metadata/errors/ObjectMetadataNotFoundError';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';

import { isDefined } from 'twenty-shared/utils';
import { type ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';

export const useObjectMetadataItem = ({
  objectNameSingular,
}: ObjectMetadataItemIdentifier) => {
  const objectMetadataItem = useRecoilValue(
    objectMetadataItemFamilySelector({
      objectName: objectNameSingular,
      objectNameType: 'singular',
    }),
  );

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

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
