import { afterEach, describe, expect, it, vi } from 'vitest';
import { type AxiosInstance } from 'axios';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { pushTasks } from 'src/logic-functions/utils/push-tasks.util';
import { type TaskNode } from 'src/logic-functions/types/types';

const DEFAULT_LIST_ID = 'default-list';

const buildAxiosInstance = (
  overrides: Partial<Record<'post' | 'patch' | 'delete', unknown>> = {},
) =>
  ({
    get: vi.fn().mockResolvedValue({ data: { id: DEFAULT_LIST_ID } }),
    post: vi.fn().mockResolvedValue({ data: { id: 'google-new' } }),
    patch: vi.fn().mockResolvedValue({ data: {} }),
    delete: vi.fn().mockResolvedValue({ data: {} }),
    ...overrides,
  }) as unknown as AxiosInstance;

const buildClient = (mutation = vi.fn().mockResolvedValue({})) =>
  ({ mutation }) as unknown as CoreApiClient;

const task = (overrides: Partial<TaskNode> = {}): TaskNode => ({
  id: 'twenty-1',
  title: 'Buy milk',
  status: 'TODO',
  dueAt: null,
  ...overrides,
});

const axiosErrorWithStatus = (status: number) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    isAxiosError: true,
    response: { status },
  });

describe('pushTasks', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('does not call Google when nothing is selected', async () => {
    const axiosInstance = buildAxiosInstance();

    const result = await pushTasks(axiosInstance, buildClient(), []);

    expect(axiosInstance.get).not.toHaveBeenCalled();
    expect(result).toEqual({ hasFailures: false });
  });

  it('creates a task that Google does not know yet', async () => {
    const axiosInstance = buildAxiosInstance();

    const result = await pushTasks(axiosInstance, buildClient(), [task()]);

    expect(axiosInstance.post).toHaveBeenCalledWith(
      `/tasks/v1/lists/${DEFAULT_LIST_ID}/tasks`,
      {
        title: 'Buy milk',
        notes: '',
        due: null,
        status: 'needsAction',
      },
    );
    expect(result).toEqual({ hasFailures: false });
  });

  it('links a freshly created task back to its Google counterpart', async () => {
    const client = buildClient();

    await pushTasks(buildAxiosInstance(), client, [task()]);

    expect(client.mutation).toHaveBeenCalledWith({
      updateTask: {
        __args: {
          id: 'twenty-1',
          data: {
            googleTasksId: 'google-new',
            googleTasksListId: DEFAULT_LIST_ID,
          },
        },
        id: true,
      },
    });
  });

  it('resends a task creation that Google rate limited', async () => {
    vi.useFakeTimers();

    const axiosInstance = buildAxiosInstance({
      post: vi
        .fn()
        .mockRejectedValueOnce(axiosErrorWithStatus(429))
        .mockResolvedValue({ data: { id: 'google-new' } }),
    });

    const result = pushTasks(axiosInstance, buildClient(), [task()]);

    await vi.runAllTimersAsync();

    expect(await result).toEqual({ hasFailures: false });
    expect(axiosInstance.post).toHaveBeenCalledTimes(2);
  });

  it('does not resend a task creation that Google may already have applied', async () => {
    const axiosInstance = buildAxiosInstance({
      post: vi.fn().mockRejectedValue(axiosErrorWithStatus(503)),
    });

    const result = await pushTasks(axiosInstance, buildClient(), [task()]);

    expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ hasFailures: true });
  });

  it('removes the Google task when it cannot be linked back to Twenty', async () => {
    const axiosInstance = buildAxiosInstance();
    const client = buildClient(
      vi.fn().mockRejectedValue(new Error('Validation failed')),
    );

    const result = await pushTasks(axiosInstance, client, [task()]);

    expect(axiosInstance.delete).toHaveBeenCalledWith(
      `/tasks/v1/lists/${DEFAULT_LIST_ID}/tasks/google-new`,
    );
    expect(result).toEqual({ hasFailures: true });
  });

  it('patches a task in the list it already belongs to', async () => {
    const axiosInstance = buildAxiosInstance();

    const result = await pushTasks(axiosInstance, buildClient(), [
      task({ googleTasksId: 'google-1', googleTasksListId: 'other-list' }),
    ]);

    expect(axiosInstance.patch).toHaveBeenCalledWith(
      '/tasks/v1/lists/other-list/tasks/google-1',
      expect.objectContaining({ title: 'Buy milk' }),
    );
    expect(result).toEqual({ hasFailures: false });
  });

  it('patches against the default list when no list was recorded', async () => {
    const axiosInstance = buildAxiosInstance();

    await pushTasks(axiosInstance, buildClient(), [
      task({ googleTasksId: 'google-1' }),
    ]);

    expect(axiosInstance.patch).toHaveBeenCalledWith(
      `/tasks/v1/lists/${DEFAULT_LIST_ID}/tasks/google-1`,
      expect.anything(),
    );
  });

  it('never links a task twice', async () => {
    const client = buildClient();

    await pushTasks(buildAxiosInstance(), client, [
      task({ googleTasksId: 'google-1', googleTasksListId: 'other-list' }),
    ]);

    expect(client.mutation).not.toHaveBeenCalled();
  });

  it('keeps sending the other tasks when one of them fails', async () => {
    const axiosInstance = buildAxiosInstance({
      patch: vi.fn().mockRejectedValue(axiosErrorWithStatus(404)),
    });

    const result = await pushTasks(axiosInstance, buildClient(), [
      task({ id: 'twenty-1', googleTasksId: 'google-1' }),
      task({ id: 'twenty-2' }),
    ]);

    expect(axiosInstance.post).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ hasFailures: true });
  });

  it('ends the run when Google rejects the credentials', async () => {
    const axiosInstance = buildAxiosInstance({
      patch: vi.fn().mockRejectedValue(axiosErrorWithStatus(401)),
    });

    await expect(
      pushTasks(axiosInstance, buildClient(), [
        task({ googleTasksId: 'google-1' }),
      ]),
    ).rejects.toThrow();
  });
});
