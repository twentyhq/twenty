import { useRecoilValue } from 'recoil';

import { ObjectMetadataItemNotFoundError } from '@/object-metadata/errors/ObjectMetadataNotFoundError';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isDefined } from '~/utils/isDefined';

import { objectMetadataItemFamilySelectorById } from '@/object-metadata/states/objectMetadataItemFamilySelectorById';

export const useObjectMetadataItemById = ({
  objectId,
}: {
  objectId: string;
}) => {
  const objectMetadataItem = useRecoilValue(
    objectMetadataItemFamilySelectorById({
      objectId,
    }),
  );

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);

  if (!isDefined(objectMetadataItem)) {
    throw new ObjectMetadataItemNotFoundError(objectId, objectMetadataItems);
  }

  return {
    objectMetadataItem,
  };
};
