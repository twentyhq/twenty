import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk';

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

  return {
    message: `Created company "${createCompany?.name}" with id ${createCompany?.id}`,
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
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
