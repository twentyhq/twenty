import { type ServerlessFunctionConfig } from 'twenty-sdk/application';

export const main = async (params: {
  firstName: string;
  lastName: string;
}): Promise<object> => {
  const response = await fetch(`${process.env.TWENTY_API_URL}/rest/people`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TWENTY_API_KEY}`,
    },
    body: JSON.stringify({
      name: {
        firstName: params.firstName,
        lastName: params.lastName,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as object;
};

export const config: ServerlessFunctionConfig = {
  universalIdentifier: '7d38261b-99c5-43e7-83d8-bdcedc2dffdb',
  name: 'create-person',
  triggers: [
    {
      universalIdentifier: 'ecf261b8-183b-4323-ab95-3b11009a0eae',
      type: 'route',
      path: '/create/person',
      httpMethod: 'POST',
      isAuthRequired: true,
    },
  ],
};
