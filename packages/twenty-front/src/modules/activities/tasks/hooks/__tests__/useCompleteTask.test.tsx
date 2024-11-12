import { MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import gql from 'graphql-tag';

import { useCompleteTask } from '@/activities/tasks/hooks/useCompleteTask';
import { Task } from '@/activities/types/Task';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';

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
            assignee {
              __typename
              avatarUrl
              colorScheme
              createdAt
              dateFormat
              deletedAt
              id
              locale
              name {
                firstName
                lastName
              }
              timeFormat
              timeZone
              updatedAt
              userEmail
              userId
            }
            assigneeId
            attachments {
              edges {
                node {
                  __typename
                  authorId
                  companyId
                  createdAt
                  deletedAt
                  fullPath
                  id
                  name
                  noteId
                  opportunityId
                  personId
                  rocketId
                  taskId
                  type
                  updatedAt
                }
              }
            }
            body
            createdAt
            createdBy {
              source
              workspaceMemberId
              name
            }
            deletedAt
            dueAt
            favorites {
              edges {
                node {
                  __typename
                  companyId
                  createdAt
                  deletedAt
                  favoriteFolderId
                  id
                  noteId
                  opportunityId
                  personId
                  position
                  rocketId
                  taskId
                  updatedAt
                  viewId
                  workflowId
                  workflowRunId
                  workflowVersionId
                  workspaceMemberId
                }
              }
            }
            id
            position
            status
            taskTargets {
              edges {
                node {
                  __typename
                  companyId
                  createdAt
                  deletedAt
                  id
                  opportunityId
                  personId
                  rocketId
                  taskId
                  updatedAt
                }
              }
            }
            timelineActivities {
              edges {
                node {
                  __typename
                  companyId
                  createdAt
                  deletedAt
                  happensAt
                  id
                  linkedObjectMetadataId
                  linkedRecordCachedName
                  linkedRecordId
                  name
                  noteId
                  opportunityId
                  personId
                  properties
                  rocketId
                  taskId
                  updatedAt
                  workflowId
                  workflowRunId
                  workflowVersionId
                  workspaceMemberId
                }
              }
            }
            title
            updatedAt
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
          __typename: 'Task',
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

const Wrapper = getJestMetadataAndApolloMocksWrapper({
  apolloMocks: mocks,
});

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
