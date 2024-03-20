import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const ObjectMetadataItemsLoadEffect = () => {
  const { objectMetadataItems: newObjectMetadataItems } =
    useFindManyObjectMetadataItems();

  const [objectMetadataItems, setObjectMetadataItems] = useRecoilState(
    objectMetadataItemsState,
  );

  useEffect(() => {
    if (!isDeeplyEqual(objectMetadataItems, newObjectMetadataItems)) {
      setObjectMetadataItems(newObjectMetadataItems);
    }
  }, [newObjectMetadataItems, objectMetadataItems, setObjectMetadataItems]);

  return <></>;
};
