import { ReactNode } from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { renderHook, waitFor } from '@testing-library/react';
import gql from 'graphql-tag';
import { RecoilRoot } from 'recoil';

import { useActivityById } from '@/activities/hooks/useActivityById';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { mockedActivities } from '~/testing/mock-data/activities';

const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        query FindOneActivity($objectRecordId: UUID!) {
          activity(filter: { id: { eq: $objectRecordId } }) {
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
        }
      `,
      variables: { objectRecordId: '1234' },
    },
    result: jest.fn(() => ({
      data: {
        activity: mockedActivities[0],
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

describe('useActivityById', () => {
  it('works as expected', async () => {
    const { result } = renderHook(
      () => useActivityById({ activityId: '1234' }),
      { wrapper: Wrapper },
    );

    expect(result.current.loading).toBe(true);

    await waitFor(() => !result.current.loading);

    expect(result.current.activity).toEqual({
      __typename: 'Activity',
      assigneeId: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
      authorId: '374fe3a5-df1e-4119-afe0-2a62a2ba481e',
      body: '',
      comments: [],
      completedAt: null,
      createdAt: '2023-04-26T10:12:42.33625+00:00',
      activityTargets: [],
      dueAt: '2023-04-26T10:12:42.33625+00:00',
      id: '3ecaa1be-aac7-463a-a38e-64078dd451d5',
      reminderAt: null,
      title: 'My very first note',
      type: 'Note',
      updatedAt: '2023-04-26T10:23:42.33625+00:00',
    });
  });
});
