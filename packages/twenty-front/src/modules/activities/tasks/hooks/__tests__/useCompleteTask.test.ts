import { renderHook } from '@testing-library/react';

import { useCompleteTask } from '@/activities/tasks/hooks/useCompleteTask';

const mockUpdateOneRecord = jest.fn();
jest.mock('@/object-record/hooks/useUpdateOneRecord', () => ({
  useUpdateOneRecord: () => ({
    updateOneRecord: mockUpdateOneRecord,
  }),
}));

describe('useCompleteTask', () => {
  it('should complete the task when called with true', async () => {
    const taskId = 'test-task-id';
    const { result } = renderHook(() =>
      useCompleteTask({ id: taskId, completedAt: null }),
    );

    const { completeTask } = result.current;
    completeTask(true);

    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      idToUpdate: taskId,
      updateOneRecordInput: {
        completedAt: expect.any(String),
      },
    });
  });

  it('should uncomplete the task when called with false', async () => {
    const taskId = 'test-task-id';
    const { result } = renderHook(() =>
      useCompleteTask({ id: taskId, completedAt: '2021-01-01T00:00:00' }),
    );

    const { completeTask } = result.current;

    completeTask(false);

    expect(mockUpdateOneRecord).toHaveBeenCalledWith({
      idToUpdate: taskId,
      updateOneRecordInput: {
        completedAt: null,
      },
    });
  });
});
