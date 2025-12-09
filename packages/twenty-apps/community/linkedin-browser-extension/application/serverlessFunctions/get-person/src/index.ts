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
  universalIdentifier: '87ea9816-c9e5-4860-b49f-a5f0759800f7',
  name: 'get-person',
  triggers: [
    {
      universalIdentifier: '54aec609-0518-4fb0-bd90-7cd21507fe11',
      type: 'route',
      path: '/get/person',
      httpMethod: 'GET',
      isAuthRequired: true,
    },
  ],
};
