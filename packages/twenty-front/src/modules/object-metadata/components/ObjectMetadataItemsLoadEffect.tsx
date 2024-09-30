import { useEffect, useMemo } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { WorkspaceActivationStatus } from '~/generated/graphql';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/objectMetadataItems';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

const filterTsVectorFields = (
  objectMetadataItems: ObjectMetadataItem[],
): ObjectMetadataItem[] => {
  return objectMetadataItems.map((item) => ({
    ...item,
    fields: item.fields.filter(
      (field) => field.type !== FieldMetadataType.TsVector,
    ),
  }));
};

export const ObjectMetadataItemsLoadEffect = () => {
  const currentUser = useRecoilValue(currentUserState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const isLoggedIn = useIsLogged();

  const { objectMetadataItems: newObjectMetadataItems } =
    useFindManyObjectMetadataItems({
      skip: !isLoggedIn,
    });

  const filteredNewObjectMetadataItems = useMemo(() => {
    return filterTsVectorFields(newObjectMetadataItems);
  }, [newObjectMetadataItems]);

  const [objectMetadataItems, setObjectMetadataItems] = useRecoilState(
    objectMetadataItemsState,
  );

  useEffect(() => {
    const toSetObjectMetadataItems =
      isUndefinedOrNull(currentUser) ||
      currentWorkspace?.activationStatus !== WorkspaceActivationStatus.Active
        ? generatedMockObjectMetadataItems
        : filteredNewObjectMetadataItems;
    if (!isDeeplyEqual(objectMetadataItems, toSetObjectMetadataItems)) {
      setObjectMetadataItems(toSetObjectMetadataItems);
    }
  }, [
    currentUser,
    currentWorkspace?.activationStatus,
<<<<<<< HEAD
    loading,
    filteredNewObjectMetadataItems,
=======
    newObjectMetadataItems,
>>>>>>> 1e4ed1e96fb099dc6985ce12abb962d6c2d26b67
    objectMetadataItems,
    setObjectMetadataItems,
  ]);

  return <></>;
};
