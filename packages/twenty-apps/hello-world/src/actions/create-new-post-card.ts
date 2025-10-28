import axios from 'axios';
import { type ServerlessFunctionConfig } from 'twenty-sdk/application';

export const main = async (params: { recipient: string }): Promise<string> => {
  const { recipient } = params;

  const options = {
    method: 'POST',
    url: 'http://localhost:3000/rest/postCards',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.TWENTY_API_KEY}`,
    },
    data: { name: recipient ?? 'Unknown' },
  };

  try {
    const { data } = await axios.request(options);

    console.log(`New post card to "${recipient}" created`);

    return data;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const config: ServerlessFunctionConfig = {
  universalIdentifier: 'e56d363b-0bdc-4d8a-a393-6f0d1c75bdcf',
  name: 'create-new-post-card',
  timeoutSeconds: 2,
  triggers: [
    {
      universalIdentifier: 'c9f84c8d-b26d-40d1-95dd-4f834ae5a2c6',
      type: 'route',
      path: '/post-card/create',
      httpMethod: 'GET',
      isAuthRequired: false,
    },
    {
      universalIdentifier: 'dd802808-0695-49e1-98c9-d5c9e2704ce2',
      type: 'cron',
      pattern: '0 0 1 1 *', // Every year 1st of January
    },
    {
      universalIdentifier: '203f1df3-4a82-4d06-a001-b8cf22a31156',
      type: 'databaseEvent',
      eventName: 'person.created',
    },
  ],
};
