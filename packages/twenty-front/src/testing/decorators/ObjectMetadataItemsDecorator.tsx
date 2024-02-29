import { useEffect } from 'react';
import { Decorator } from '@storybook/react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';

export const ObjectMetadataItemsDecorator: Decorator = (Story) => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const setCurrentWorkspaceMember = useSetRecoilState(
    currentWorkspaceMemberState,
  );

  useEffect(
    () => setCurrentWorkspaceMember(mockWorkspaceMembers[0]),
    [setCurrentWorkspaceMember],
  );

  return (
    <>
      <ObjectMetadataItemsLoadEffect />
      {!!objectMetadataItems.length && <Story />}
    </>
  );
};
