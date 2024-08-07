import { gql } from '@apollo/client';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useActivities } from '@/activities/hooks/useActivities';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
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

const mockActivity = {
  __typename: 'Task',
  updatedAt: '2021-08-03T19:20:06.000Z',
  createdAt: '2021-08-03T19:20:06.000Z',
  status: 'DONE',
  reminderAt: '2021-08-03T19:20:06.000Z',
  title: 'title',
  body: 'body',
  dueAt: '2021-08-03T19:20:06.000Z',
  assigneeId: '1',
  id: '234',
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
          $orderBy: [ActivityTargetOrderByInput]
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
                activityId
                id
              }
              cursor
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
            totalCount
          }
        }
      `,
      variables: {
        filter: { companyId: { eq: '123' } },
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
  {
    request: {
      query: gql`
        query FindManyTasks(
          $filter: TaskFilterInput
          $orderBy: [TaskOrderByInput]
          $lastCursor: String
          $limit: Int
        ) {
          tasks(
            filter: $filter
            orderBy: $orderBy
            first: $limit
            after: $lastCursor
          ) {
            edges {
              node {
                __typename
                title
                id
                updatedAt
                createdAt
                body
                status
                dueAt
              }
              cursor
            }
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
            totalCount
          }
        }
      `,
      variables: {
        filter: { id: { in: ['234'] } },
        limit: undefined,
        orderBy: [{}],
      },
    },
    result: jest.fn(() => ({
      data: {
        activities: {
          ...defaultResponseData,
          edges: [
            {
              node: mockActivity,
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

describe('useActivities', () => {
  it('returns default response', () => {
    const { result } = renderHook(
      () =>
        useActivities({
          objectNameSingular: CoreObjectNameSingular.Task,
          targetableObjects: [],
          activitiesFilters: {},
          activitiesOrderByVariables: [{}],
          skip: false,
        }),
      { wrapper: Wrapper },
    );

    expect(result.current).toEqual({
      activities: [],
      loading: false,
    });
  });

  it('fetches activities', async () => {
    const { result } = renderHook(
      () => {
        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );

        const activities = useActivities({
          objectNameSingular: CoreObjectNameSingular.Task,
          targetableObjects: [
            { targetObjectNameSingular: 'company', id: '123' },
          ],
          activitiesFilters: {},
          activitiesOrderByVariables: [{}],
          skip: false,
        });
        return { activities, setCurrentWorkspaceMember };
      },
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.setCurrentWorkspaceMember(mockWorkspaceMembers[0]);
    });

    await waitFor(() => {
      expect(result.current.activities.loading).toBe(false);
    });

    const { activities } = result.current;

    expect(activities.activities).toEqual([mockActivity]);
  });
});
