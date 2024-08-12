import { MockedProvider, MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import gql from 'graphql-tag';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { useCompleteTask } from '@/activities/tasks/hooks/useCompleteTask';
import { Task } from '@/activities/types/Task';

const task: Task = {
  id: '123',
  status: 'DONE',
  title: 'Test',
  body: 'Test',
  dueAt: '2024-03-15T07:33:14.212Z',
  createdAt: '2024-03-15T07:33:14.212Z',
  updatedAt: '2024-03-15T07:33:14.212Z',
  assignee: null,
  assigneeId: null,
  taskTargets: [],
  __typename: 'Task',
};

const mocks: MockedResponse[] = [
  {
    request: {
      query: gql`
        mutation UpdateOneTask($idToUpdate: ID!, $input: TaskUpdateInput!) {
          updateTask(id: $idToUpdate, data: $input) {
            __typename
            status
            assigneeId
            updatedAt
            body
            createdAt
            dueAt
            position
            id
            title
            createdBy {
              source
              workspaceMemberId
              name
            }
          }
        }
      `,
      variables: {
        idToUpdate: task.id,
        input: { status: task.status },
      },
    },
    result: jest.fn(() => ({
      data: {
        updateTask: {
          __typename: 'Activity',
          createdAt: '2024-03-15T07:33:14.212Z',
          reminderAt: null,
          authorId: '123',
          title: 'Test',
          status: 'DONE',
          updatedAt: '2024-03-15T07:33:14.212Z',
          body: 'Test',
          dueAt: '2024-03-15T07:33:14.212Z',
          type: 'TASK',
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
