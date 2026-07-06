import { CoreApiClient } from 'twenty-client-sdk/core';

export type CreateTaskInput = {
  title?: string;
  body?: string;
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE';
  dueAt?: string;
  assigneeId?: string;
  targetRecordId?: string;
};

export type CreateTaskResult =
  | { success: true; taskId: string; taskTargetId: string }
  | { success: false; error: string };

// Creates a Task and links it to a record through the given taskTarget morph
// field (targetPersonId / targetCompanyId / targetOpportunityId) in one step.
export const createTaskForTarget = async (
  input: CreateTaskInput,
  targetFieldName: string,
): Promise<CreateTaskResult> => {
  if (!input.title) {
    return { success: false, error: '`title` is required.' };
  }

  if (!input.targetRecordId) {
    return { success: false, error: '`targetRecordId` is required.' };
  }

  const client = new CoreApiClient();

  const taskResult = await client.mutation({
    createTask: {
      __args: {
        data: {
          title: input.title,
          bodyV2: { markdown: input.body ?? '' },
          status: input.status ?? 'TODO',
          ...(input.dueAt ? { dueAt: input.dueAt } : {}),
          ...(input.assigneeId ? { assigneeId: input.assigneeId } : {}),
        },
      },
      id: true,
    },
  } as any);

  const taskId = (taskResult as any).createTask.id as string;

  const taskTargetResult = await client.mutation({
    createTaskTarget: {
      __args: {
        data: {
          taskId,
          [targetFieldName]: input.targetRecordId,
        },
      },
      id: true,
    },
  } as any);

  const taskTargetId = (taskTargetResult as any).createTaskTarget.id as string;

  return { success: true, taskId, taskTargetId };
};
