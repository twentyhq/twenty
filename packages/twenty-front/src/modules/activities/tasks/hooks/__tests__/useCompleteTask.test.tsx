import { type MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';

import { useCompleteTask } from '@/activities/tasks/hooks/useCompleteTask';
import { type Task } from '@/activities/types/Task';
import { generateUpdateOneRecordMutation } from '@/object-metadata/utils/generateUpdateOneRecordMutation';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

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

const updateOneTaskMutation = generateUpdateOneRecordMutation({
  objectMetadataItem: getMockObjectMetadataItemOrThrow('task'),
  objectMetadataItems: generatedMockObjectMetadataItems,
  computeReferences: false,
  objectPermissionsByObjectMetadataId: {},
});

const mocks: MockedResponse[] = [
  {
    request: {
      query: updateOneTaskMutation,
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
