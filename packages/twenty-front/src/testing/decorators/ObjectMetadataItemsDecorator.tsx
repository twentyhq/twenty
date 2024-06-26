import { useEffect, useMemo } from 'react';
import { Decorator } from '@storybook/react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ObjectMetadataItemsLoadEffect } from '@/object-metadata/components/ObjectMetadataItemsLoadEffect';
import { PreComputedChipGeneratorsContext } from '@/object-metadata/context/PreComputedChipGeneratorsContext';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getRecordChipGeneratorPerObjectPerField } from '@/object-record/utils/getRecordChipGeneratorPerObjectPerField';
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

  const chipGeneratorPerObjectPerField = useMemo(() => {
    return getRecordChipGeneratorPerObjectPerField(objectMetadataItems);
  }, [objectMetadataItems]);

  return (
    <>
      <ObjectMetadataItemsLoadEffect />
      <PreComputedChipGeneratorsContext.Provider
        value={{
          chipGeneratorPerObjectPerField,
        }}
      >
        {!!objectMetadataItems.length && <Story />}
      </PreComputedChipGeneratorsContext.Provider>
    </>
  );
};
