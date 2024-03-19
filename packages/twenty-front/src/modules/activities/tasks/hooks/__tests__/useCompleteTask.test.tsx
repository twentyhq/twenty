import { ReactNode } from 'react';
import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import gql from 'graphql-tag';
import { RecoilRoot } from 'recoil';

import { useCompleteTask } from '@/activities/tasks/hooks/useCompleteTask';

const task = { id: '123', completedAt: '2024-03-15T07:33:14.212Z' };

const mockedDate = task.completedAt;
const toISOStringMock = jest.fn(() => mockedDate);
global.Date.prototype.toISOString = toISOStringMock;

const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        mutation UpdateOneActivity(
          $idToUpdate: ID!
          $input: ActivityUpdateInput!
        ) {
          updateActivity(id: $idToUpdate, data: $input) {
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
        idToUpdate: task.id,
        input: { completedAt: task.completedAt },
      },
    },
    result: jest.fn(() => ({
      data: {
        updateActivity: {
          __typename: 'Activity',
          createdAt: '2024-03-15T07:33:14.212Z',
          reminderAt: null,
          authorId: '123',
          title: 'Test',
          completedAt: '2024-03-15T07:33:14.212Z',
          updatedAt: '2024-03-15T07:33:14.212Z',
          body: 'Test',
          dueAt: '2024-03-15T07:33:14.212Z',
          type: 'Task',
          id: '123',
          assigneeId: '123',
        },
      },
    })),
  },
];

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  </RecoilRoot>
);

describe('useCompleteTask', () => {
  it('should complete task', async () => {
    const { result } = renderHook(() => useCompleteTask(task), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.completeTask(true);
    });

    expect(mocks[0].result).toHaveBeenCalled();
  });
});
