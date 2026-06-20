import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

type Input = {
  record?: {
    id?: string;
    subject?: string | null;
  } | null;
};

type Output = {
  success: boolean;
  taskId?: string;
  supportTicketId?: string;
  processedAt: string;
};

const handler = async (input: Input): Promise<Output> => {
  const client = new CoreApiClient();
  const supportTicketId = input.record?.id;
  const subject = input.record?.subject ?? 'New ticket';
  const dueAt = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

  const taskResult = await client.mutation({
    createTask: {
      __args: {
        data: {
          body: `Follow up on support ticket: ${subject}`,
          dueAt,
        },
      },
      id: true,
    },
  });

  const taskId = (taskResult as { createTask?: { id?: string } })?.createTask?.id;

  if (taskId && supportTicketId) {
    await client.mutation({
      createTaskTarget: {
        __args: {
          data: {
            taskId,
            xopureSupportTicketId: supportTicketId,
          },
        },
        id: true,
      },
    });
  }

  return {
    success: true,
    taskId,
    supportTicketId,
    processedAt: new Date().toISOString(),
  };
};

export default defineLogicFunction({
  universalIdentifier: '48400dd3-e1a7-4ef0-a7cb-2e165a3dc25b',
  name: 'support-ticket-task-creator',
  description: 'Auto-creates a Task when a support ticket is created.',
  timeoutSeconds: 60,
  handler,
  databaseEventTriggerSettings: {
    eventName: 'xopureSupportTicket.created',
  },
});
