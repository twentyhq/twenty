import { useEffect } from 'react';
import { useRecoilCallback, useRecoilValue } from 'recoil';

import { useIsLogged } from '@/auth/hooks/useIsLogged';
import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useFindManyObjectMetadataItems } from '@/object-metadata/hooks/useFindManyObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { WorkspaceActivationStatus } from '~/generated/graphql';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';
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

  const updateObjectMetadataItems = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const filteredFields = filterTsVectorFields(newObjectMetadataItems);
        const toSetObjectMetadataItems =
          isUndefinedOrNull(currentUser) ||
          currentWorkspace?.activationStatus !==
            WorkspaceActivationStatus.Active
            ? generatedMockObjectMetadataItems
            : filteredFields;

        if (
          !isDeeplyEqual(
            snapshot.getLoadable(objectMetadataItemsState).getValue(),
            toSetObjectMetadataItems,
          )
        ) {
          set(objectMetadataItemsState, toSetObjectMetadataItems);
        }
      },
    [currentUser, currentWorkspace?.activationStatus, newObjectMetadataItems],
  );

  useEffect(() => {
    updateObjectMetadataItems();
  }, [updateObjectMetadataItems]);

  return <></>;
};
