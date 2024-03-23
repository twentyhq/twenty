import { ReactNode } from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import gql from 'graphql-tag';
import pick from 'lodash/pick';
import { RecoilRoot } from 'recoil';

import { useCreateActivityInDB } from '@/activities/hooks/useCreateActivityInDB';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
import { mockedActivities } from '~/testing/mock-data/activities';

const mockedDate = '2024-03-15T12:00:00.000Z';
const toISOStringMock = jest.fn(() => mockedDate);
global.Date.prototype.toISOString = toISOStringMock;

const mockedActivity = {
  ...pick(mockedActivities[0], [
    'id',
    'title',
    'body',
    'type',
    'completedAt',
    'dueAt',
  ]),
  updatedAt: mockedDate,
};

const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        mutation CreateOneActivity($input: ActivityCreateInput!) {
          createActivity(data: $input) {
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
      variables: {
        input: mockedActivity,
      },
    },
    result: jest.fn(() => ({
      data: {
        createActivity: {
          ...mockedActivity,
          __typename: 'Activity',
          assigneeId: '',
          authorId: '1',
          reminderAt: null,
          createdAt: mockedDate,
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

describe('useCreateActivityInDB', () => {
  it('Should create activity in DB', async () => {
    const { result } = renderHook(() => useCreateActivityInDB(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.createActivityInDB(mockedActivity);
    });

    expect(mocks[0].result).toHaveBeenCalled();
  });
});
