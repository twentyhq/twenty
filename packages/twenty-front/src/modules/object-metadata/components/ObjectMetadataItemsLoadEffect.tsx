import { useEffect } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { WorkspaceActivationStatus } from '~/generated/graphql';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const ObjectMetadataItemsLoadEffect = () => {
  const currentUser = useRecoilValue(currentUserState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const isLoggedIn = useIsLogged();

  const {
    objectMetadataItems: newObjectMetadataItems,
    loading: isObjectMetadataLoading,
  } = useFindManyObjectMetadataItems({
    skip: !isLoggedIn,
  });

  const updateObjectMetadataItems = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const toSetObjectMetadataItems =
          isUndefinedOrNull(currentUser) ||
          currentWorkspace?.activationStatus !==
            WorkspaceActivationStatus.Active
            ? generatedMockObjectMetadataItems
            : newObjectMetadataItems;

        if (
          !isObjectMetadataLoading &&
          !isDeeplyEqual(
            snapshot.getLoadable(objectMetadataItemsState).getValue(),
            toSetObjectMetadataItems,
          )
        ) {
          set(objectMetadataItemsState, toSetObjectMetadataItems);
        }
      },
    [
      currentUser,
      currentWorkspace?.activationStatus,
      isObjectMetadataLoading,
      newObjectMetadataItems,
    ],
  );

  useEffect(() => {
    updateObjectMetadataItems();
  }, [updateObjectMetadataItems]);

  return <></>;
};
