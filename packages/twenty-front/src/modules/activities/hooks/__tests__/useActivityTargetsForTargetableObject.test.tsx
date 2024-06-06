import { ReactNode } from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import gql from 'graphql-tag';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useActivityTargetsForTargetableObject } from '@/activities/hooks/useActivityTargetsForTargetableObject';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';

const mockActivityTarget = {
  __typename: 'ActivityTarget',
  updatedAt: '2021-08-03T19:20:06.000Z',
  createdAt: '2021-08-03T19:20:06.000Z',
  personId: '1',
  activityId: '234',
  companyId: '1',
  id: '123',
};

const defaultResponseData = {
  pageInfo: {
    hasNextPage: false,
    startCursor: '',
    endCursor: '',
  },
  totalCount: 1,
};

const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        query FindManyActivityTargets(
          $filter: ActivityTargetFilterInput
          $orderBy: ActivityTargetOrderByInput
          $lastCursor: String
          $limit: Int
        ) {
          activityTargets(
            filter: $filter
            orderBy: $orderBy
            first: $limit
            after: $lastCursor
          ) {
            edges {
              node {
                __typename
                updatedAt
                createdAt
                personId
                activityId
                companyId
                id
              }
              cursor
            }
            pageInfo {
              hasNextPage
              startCursor
              endCursor
            }
            totalCount
          }
        }
      `,
      variables: {
        filter: { personId: { eq: '1234' } },
        limit: undefined,
        orderBy: undefined,
      },
    },
    result: jest.fn(() => ({
      data: {
        activityTargets: {
          ...defaultResponseData,
          edges: [
            {
              node: mockActivityTarget,
              cursor: '1',
            },
          ],
        },
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

describe('useActivityTargetsForTargetableObject', () => {
  it('works as expected', async () => {
    const { result } = renderHook(
      () => {
        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );

        const res = useActivityTargetsForTargetableObject({
          targetableObject: {
            id: '1234',
            targetObjectNameSingular: 'person',
          },
        });
        return { ...res, setCurrentWorkspaceMember };
      },
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.setCurrentWorkspaceMember(mockWorkspaceMembers[0]);
    });

    expect(result.current.loadingActivityTargets).toBe(true);

    await waitFor(() => !result.current.loadingActivityTargets);

    expect(result.current.activityTargets).toEqual([mockActivityTarget]);
  });
});
