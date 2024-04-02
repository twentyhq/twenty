import { useEffect } from 'react';
import { Decorator } from '@storybook/react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { mockedUsersData } from '~/testing/mock-data/users';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';

export const ObjectMetadataItemsDecorator: Decorator = (Story) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );
  const setCurrentUser = useSetRecoilState(currentUserState);

  useEffect(() => {
    setCurrentWorkspaceMember(mockWorkspaceMembers[0]);
    setCurrentUser(mockedUsersData[0]);
  }, [setCurrentUser, setCurrentWorkspaceMember]);

  return (
    <>
      <ObjectMetadataItemsLoadEffect />
      {!!objectMetadataItems.length && <Story />}
    </>
  );
};
