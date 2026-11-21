import { graphApiRequest } from 'src/logic-functions/data/graph-api-request.util';
import { type MessengerPage } from 'src/logic-functions/types/messenger-page.type';

// Pages assigned to the system user; their tokens are derived from it and never stored
export const listMessengerPages = async (
  accessToken: string,
): Promise<MessengerPage[]> => {
  const { data } = await graphApiRequest<{ data: MessengerPage[] }>({
    accessToken,
    method: 'GET',
    path: 'me/accounts',
    query: { fields: 'id,name,access_token', limit: '100' },
  });

  return data;
};
