import { type Decorator } from '@storybook/react';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { PreComputedChipGeneratorsProvider } from '@/object-metadata/components/PreComputedChipGeneratorsProvider';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { mockedUserData } from '~/testing/mock-data/users';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';

export const ObjectMetadataItemsDecorator: Decorator = (Story) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );
  const setCurrentUser = useSetRecoilState(currentUserState);
  const setCurrentUserWorkspace = useSetRecoilState(currentUserWorkspaceState);

  const { loadMockedObjectMetadataItems } = useLoadMockedObjectMetadataItems();

  useEffect(() => {
    setCurrentWorkspaceMember(mockWorkspaceMembers[0]);
    setCurrentUser(mockedUserData);
    setCurrentUserWorkspace(mockedUserData.currentUserWorkspace);
    loadMockedObjectMetadataItems();
  }, [
    setCurrentUser,
    setCurrentWorkspaceMember,
    setCurrentUserWorkspace,
    loadMockedObjectMetadataItems,
  ]);

  return (
    <>
      <PreComputedChipGeneratorsProvider>
        {!!objectMetadataItems.length && <Story />}
      </PreComputedChipGeneratorsProvider>
    </>
  );
};
