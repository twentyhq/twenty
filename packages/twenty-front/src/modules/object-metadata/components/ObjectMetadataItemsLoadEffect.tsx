import { useEffect } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const ObjectMetadataItemsLoadEffect = () => {
  const currentUser = useRecoilValue(currentUserState);
  const { objectMetadataItems: newObjectMetadataItems } =
    useFindManyObjectMetadataItems({
      skip: isUndefinedOrNull(currentUser),
    });

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
