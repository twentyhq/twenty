import { type Decorator } from '@storybook/react-vite';
import { useEffect } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PreComputedChipGeneratorsProvider } from '@/object-metadata/components/PreComputedChipGeneratorsProvider';
import { useLoadMockedObjectMetadataItems } from '@/object-metadata/hooks/useLoadMockedObjectMetadataItems';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { mockedUserData } from '~/testing/mock-data/users';
import { mockedWorkspaceMemberRecords } from '~/testing/mock-data/generated/data/workspaceMembers/mock-workspaceMembers-data';

export const ObjectMetadataItemsDecorator: Decorator = (Story) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsState);
  const setCurrentWorkspaceMember = useSetAtomState(
    currentWorkspaceMemberState,
  );
  const setCurrentUser = useSetAtomState(currentUserState);
  const setCurrentUserWorkspace = useSetAtomState(currentUserWorkspaceState);

  const { loadMockedObjectMetadataItems } = useLoadMockedObjectMetadataItems();

  useEffect(() => {
    setCurrentWorkspaceMember(
      getRecordFromRecordNode<WorkspaceMember>({
        recordNode: mockedWorkspaceMemberRecords[0],
      }),
    );
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
