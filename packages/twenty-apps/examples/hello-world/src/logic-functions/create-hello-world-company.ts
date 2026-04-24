import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

const handler = async (): Promise<{ message: string }> => {
  const client = new CoreApiClient();

  const { createCompany } = await client.mutation({
    createCompany: {
      __args: {
        data: {
          name: 'Hello World',
        },
      },
      id: true,
      name: true,
    },
  });

  if (!createCompany?.id || !createCompany?.name) {
    throw new Error('Failed to create company: missing id or name in response');
  }

  return {
    message: `Created company "${createCompany.name}" with id ${createCompany.id}`,
  };
};

export default defineLogicFunction({
  universalIdentifier: '94abaa53-d265-4fa4-ae52-1d7ea711ecf2',
  name: 'create-hello-world-company',
  description: 'Creates a company called Hello World',
  timeoutSeconds: 5,
  handler,
  httpRouteTriggerSettings: {
    path: '/create-hello-world-company',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
