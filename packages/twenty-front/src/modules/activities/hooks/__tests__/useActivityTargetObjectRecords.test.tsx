import { ReactNode } from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { act, renderHook, waitFor } from '@testing-library/react';
import gql from 'graphql-tag';
import { RecoilRoot, useSetRecoilState } from 'recoil';

import { useActivityTargetObjectRecords } from '@/activities/hooks/useActivityTargetObjectRecords';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { mockedActivities } from '~/testing/mock-data/activities';
import { mockedCompaniesData } from '~/testing/mock-data/companies';
import { mockedPeopleData } from '~/testing/mock-data/people';
import { mockWorkspaceMembers } from '~/testing/mock-data/workspace-members';

const defaultResponseData = {
  pageInfo: {
    hasNextPage: false,
    startCursor: '',
    endCursor: '',
  },
  totalCount: 1,
};

const mockActivityTarget = {
  __typename: 'ActivityTarget',
  updatedAt: '2021-08-03T19:20:06.000Z',
  createdAt: '2021-08-03T19:20:06.000Z',
  personId: '1',
  activityId: '234',
  companyId: '1',
  id: '123',
  person: { ...mockedPeopleData[0], __typename: 'Person', updatedAt: '' },
  company: { ...mockedCompaniesData[0], __typename: 'Company', updatedAt: '' },
  activity: mockedActivities[0],
};

const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        query FindManyActivityTargets(
          $filter: ActivityTargetFilterInput
          $orderBy: ActivityTargetOrderByInput
          $lastCursor: String
          $limit: Float
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
                company {
                  __typename
                  xLink {
                    label
                    url
                  }
                  linkedinLink {
                    label
                    url
                  }
                  domainName
                  annualRecurringRevenue {
                    amountMicros
                    currencyCode
                  }
                  createdAt
                  address
                  updatedAt
                  name
                  accountOwnerId
                  employees
                  id
                  idealCustomerProfile
                }
                personId
                activityId
                companyId
                id
                activity {
                  __typename
                  createdAt
                  reminderAt
                  authorId
                  title
                  completedAt
                  updatedAt
                  body
                  dueAt
                  type
                  id
                  assigneeId
                }
                person {
                  __typename
                  xLink {
                    label
                    url
                  }
                  id
                  createdAt
                  city
                  email
                  jobTitle
                  name {
                    firstName
                    lastName
                  }
                  phone
                  linkedinLink {
                    label
                    url
                  }
                  updatedAt
                  avatarUrl
                  companyId
                }
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
        filter: { activityId: { eq: '1234' } },
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

const mockObjectMetadataItems = getObjectMetadataItemsMock();

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider mocks={mocks} addTypename={false}>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        {children}
      </SnackBarProviderScope>
    </MockedProvider>
  </RecoilRoot>
);

describe('useActivityTargetObjectRecords', () => {
  it('returns default response', () => {
    const { result } = renderHook(
      () => useActivityTargetObjectRecords({ activityId: '1234' }),
      { wrapper: Wrapper },
    );

    expect(result.current).toEqual({
      activityTargetObjectRecords: [],
      loadingActivityTargets: false,
    });
  });

  it('fetches records', async () => {
    const { result } = renderHook(
      () => {
        const setCurrentWorkspaceMember = useSetRecoilState(
          currentWorkspaceMemberState,
        );
        const setObjectMetadataItems = useSetRecoilState(
          objectMetadataItemsState,
        );

        const { activityTargetObjectRecords, loadingActivityTargets } =
          useActivityTargetObjectRecords({ activityId: '1234' });
        return {
          activityTargetObjectRecords,
          loadingActivityTargets,
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

    expect(result.current.loadingActivityTargets).toBe(true);

    // Wait for activityTargets to complete fetching
    await waitFor(() => !result.current.loadingActivityTargets);

    expect(mocks[0].result).toHaveBeenCalled();
    expect(result.current.activityTargetObjectRecords).toHaveLength(1);
    expect(
      result.current.activityTargetObjectRecords[0].targetObjectNameSingular,
    ).toBe('person');
  });
});
