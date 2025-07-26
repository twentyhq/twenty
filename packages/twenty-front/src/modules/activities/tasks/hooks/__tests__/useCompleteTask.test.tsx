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
  bodyV2: {
    blocknote: 'Test',
    markdown: 'Test',
  },
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
        mutation UpdateOneTask($idToUpdate: UUID!, $input: TaskUpdateInput!) {
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
              position
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
                  petId
                  rocketId
                  surveyResultId
                  taskId
                  type
                  updatedAt
                }
              }
            }
            bodyV2 {
              blocknote
              markdown
            }
            createdAt
            createdBy {
              source
              workspaceMemberId
              name
              context
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
                  forWorkspaceMemberId
                  id
                  noteId
                  opportunityId
                  personId
                  petId
                  position
                  rocketId
                  surveyResultId
                  taskId
                  updatedAt
                  viewId
                  workflowId
                  workflowRunId
                  workflowVersionId
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
                  petId
                  rocketId
                  surveyResultId
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
                  petId
                  properties
                  rocketId
                  surveyResultId
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
          assignee: null,
          assigneeId: '123',
          attachments: { edges: [] },
          bodyV2: {
            blocknote: 'Test',
            markdown: 'Test',
          },
          createdAt: '2024-03-15T07:33:14.212Z',
          createdBy: {
            source: 'MANUAL',
            workspaceMemberId: '123',
            name: 'Test User',
            context: 'test',
          },
          deletedAt: null,
          dueAt: '2024-03-15T07:33:14.212Z',
          favorites: { edges: [] },
          id: '123',
          position: 1,
          status: 'DONE',
          taskTargets: { edges: [] },
          timelineActivities: { edges: [] },
          title: 'Test',
          updatedAt: '2024-03-15T07:33:14.212Z',
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
