import { type MockedResponse } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';

import { useCompleteTask } from '@/activities/tasks/hooks/useCompleteTask';
import { type Task } from '@/activities/types/Task';
import { generateUpdateOneRecordMutation } from '@/object-metadata/utils/generateUpdateOneRecordMutation';
import { getJestMetadataAndApolloMocksWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksWrapper';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
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
  objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
  computeReferences: false,
  objectPermissionsByObjectMetadataId: {},
});

const buildUpdateStatusMock = (status: Task['status']): MockedResponse => ({
  request: {
    query: updateOneTaskMutation,
    variables: {
      idToUpdate: task.id,
      input: { status },
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
        status,
        taskTargets: { edges: [] },
        timelineActivities: { edges: [] },
        title: 'Test',
        updatedAt: '2024-03-15T07:33:14.212Z',
      },
    },
  })),
});

describe('useCompleteTask', () => {
  it('should complete task', async () => {
    const mocks = [buildUpdateStatusMock('DONE')];
    const Wrapper = getJestMetadataAndApolloMocksWrapper({
      apolloMocks: mocks,
    });

    const { result } = renderHook(() => useCompleteTask(task), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.completeTask(true);
    });

    expect(mocks[0].result).toHaveBeenCalled();
  });

  it.each([
    { initialStatus: 'TODO', expectedStatusOnReopen: 'TODO' },
    { initialStatus: 'IN_PROGRESS', expectedStatusOnReopen: 'IN_PROGRESS' },
  ] as const)(
    'should restore status to $initialStatus when reopening a task completed from $initialStatus',
    async ({ initialStatus, expectedStatusOnReopen }) => {
      const completeMock = buildUpdateStatusMock('DONE');
      const reopenMock = buildUpdateStatusMock(expectedStatusOnReopen);
      const mocks = [completeMock, reopenMock];
      const Wrapper = getJestMetadataAndApolloMocksWrapper({
        apolloMocks: mocks,
      });

      const initialTask: Task = { ...task, status: initialStatus };

      const { result, rerender } = renderHook(
        ({ task }) => useCompleteTask(task),
        { wrapper: Wrapper, initialProps: { task: initialTask } },
      );

      await act(async () => {
        await result.current.completeTask(true);
      });

      expect(completeMock.result).toHaveBeenCalled();

      // Simulate the record coming back from the cache/server as DONE,
      // the way it would after the mutation above resolves in the app.
      rerender({ task: { ...initialTask, status: 'DONE' } });

      await act(async () => {
        await result.current.completeTask(false);
      });

      expect(reopenMock.result).toHaveBeenCalled();
    },
  );
});
