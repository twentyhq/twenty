import { ReactNode } from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useAttachRelationInBothDirections } from '@/activities/hooks/useAttachRelationInBothDirections';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';

const mocks: MockedResponse[] = [];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider mocks={mocks} addTypename={false}>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        {children}
      </SnackBarProviderScope>
    </MockedProvider>
  </RecoilRoot>
);

const mockObjectMetadataItems = getObjectMetadataItemsMock();

describe('useAttachRelationInBothDirections', () => {
  it('works as expected', () => {
    const { result } = renderHook(
      () => {
        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );
        const setObjectMetadataItems = useSetRecoilState(
          objectMetadataItemsState,
        );

        const res = useAttachRelationInBothDirections();
        return {
          ...res,
          setCurrentWorkspaceMember,
          setObjectMetadataItems,
        };
      },
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.setCurrentWorkspaceMember(mockWorkspaceMembers[0]);
      result.current.setObjectMetadataItems(mockObjectMetadataItems);
    });
    const targetRecords = [
      { id: '5678', person: { id: '1234' } },
      { id: '91011', person: { id: '1234' } },
    ];

    const forEachSpy = jest.spyOn(targetRecords, 'forEach');

    act(() => {
      result.current.attachRelationInBothDirections({
        sourceRecord: {
          id: '1234',
          company: { id: '5678' },
        },
        targetRecords,
        sourceObjectNameSingular: 'person',
        targetObjectNameSingular: 'company',
        fieldNameOnSourceRecord: 'company',
        fieldNameOnTargetRecord: 'person',
      });
    });

    // expect forEach to have been called on targetRecords
    expect(forEachSpy).toHaveBeenCalled();
  });
});
