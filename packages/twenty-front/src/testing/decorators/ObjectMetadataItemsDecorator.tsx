import { Decorator } from '@storybook/react';
import { useEffect } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { PreComputedChipGeneratorsProvider } from '@/object-metadata/components/PreComputedChipGeneratorsProvider';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { mockedUserData } from '~/testing/mock-data/users';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';

export const ObjectMetadataItemsDecorator: Decorator = (Story) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );
  const setCurrentUser = useSetRecoilState(currentUserState);

  useEffect(() => {
    setCurrentWorkspaceMember(mockWorkspaceMembers[0]);
    setCurrentUser(mockedUserData);
  }, [setCurrentUser, setCurrentWorkspaceMember]);

  return (
    <>
      <ObjectMetadataItemsLoadEffect />
      <PreComputedChipGeneratorsProvider>
        {!!objectMetadataItems.length && <Story />}
      </PreComputedChipGeneratorsProvider>
    </>
  );
};
