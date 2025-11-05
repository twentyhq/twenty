import { type ServerlessFunctionConfig } from 'twenty-sdk/application';

export const main = async (params: { name: string }): Promise<object> => {
  const response = await fetch(`${process.env.TWENTY_API_URL}/rest/companies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TWENTY_API_KEY}`,
    },
    body: JSON.stringify({
      name: params.name,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return (await response.json()) as object;
};

export const config: ServerlessFunctionConfig = {
  universalIdentifier: 'cead3d1e-1fbd-4b09-86a9-f0bedf4d54fa',
  name: 'create-company',
  triggers: [
    {
      universalIdentifier: '57ff5ea2-c4b7-458c-9296-27bad6acdaf9',
      type: 'route',
      path: '/create/company',
      httpMethod: 'POST',
      isAuthRequired: true,
    },
  ],
};
