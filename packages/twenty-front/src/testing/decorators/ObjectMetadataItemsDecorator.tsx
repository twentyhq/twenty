import { type Decorator } from '@storybook/react-vite';
import { useEffect } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useSetRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetRecoilStateV2';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { PreComputedChipGeneratorsProvider } from '@/object-metadata/components/PreComputedChipGeneratorsProvider';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { mockedUserData } from '~/testing/mock-data/users';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';

export const ObjectMetadataItemsDecorator: Decorator = (Story) => {
  const objectMetadataItems = useRecoilValueV2(objectMetadataItemsState);
  const setCurrentWorkspaceMember = useSetRecoilStateV2(
    currentWorkspaceMemberState,
  );
  const setCurrentUser = useSetRecoilStateV2(currentUserState);
  const setCurrentUserWorkspace = useSetRecoilStateV2(
    currentUserWorkspaceState,
  );

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
