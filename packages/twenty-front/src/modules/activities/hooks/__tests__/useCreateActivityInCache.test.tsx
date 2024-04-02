import { ReactNode } from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import gql from 'graphql-tag';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useCreateActivityInCache } from '@/activities/hooks/useCreateActivityInCache';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';

const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        query FindOneWorkspaceMember($objectRecordId: UUID!) {
          workspaceMember(filter: { id: { eq: $objectRecordId } }) {
            __typename
            colorScheme
            name {
              firstName
              lastName
            }
            locale
            userId
            avatarUrl
            createdAt
            updatedAt
            id
          }
        }
      `,
      variables: { objectRecordId: '20202020-1553-45c6-a028-5a9064cce07f' },
    },
    result: jest.fn(() => ({
      data: {
        workspaceMember: mockWorkspaceMembers[0],
      },
    })),
  },
];

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

describe('useCreateActivityInCache', () => {
  it('Should create activity in cache', async () => {
    const { result } = renderHook(
      () => {
        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );
        const setObjectMetadataItems = useSetRecoilState(
          objectMetadataItemsState,
        );

        const res = useCreateActivityInCache();
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

    act(() => {
      const res = result.current.createActivityInCache({
        type: 'Note',
        targetableObjects: [
          {
            targetObjectNameSingular: 'person',
            id: '1234',
          },
        ],
      });

      expect(res.createdActivityInCache).toHaveProperty('id');
      expect(res.createdActivityInCache).toHaveProperty('__typename');
      expect(res.createdActivityInCache).toHaveProperty('activityTargets');
    });
  });
});
