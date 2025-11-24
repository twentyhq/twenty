import { type ServerlessFunctionConfig } from 'twenty-sdk/application';

export const main = async (params: {
  a: string;
  b: number;
}): Promise<object> => {
  const { a, b } = params;

  // Rename the parameters and code below with your own logic
  // This is just an example
  const message = `Hello, input: ${a} and ${b}`;

  return { message };
};

export const config: ServerlessFunctionConfig = {
  universalIdentifier: '8e43b96b-49a1-4e21-b257-e432a757b09f',
  name: 'get-company',
  triggers: [
    {
      universalIdentifier: '7a2bb8ad-6366-49ac-9f73-db9c4713c5af',
      type: 'route',
      path: '/get/company',
      httpMethod: 'GET',
      isAuthRequired: true,
    },
  ],
};
