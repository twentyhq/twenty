import { isNonEmptyString } from '@sniptt/guards';

import { GraphApiError } from 'src/logic-functions/data/graph-api-error';
import { graphApiRequest } from 'src/logic-functions/data/graph-api-request.util';
import { type PersonName } from 'src/logic-functions/types/person-name.type';

// needs Advanced Access to Business Asset User Profile Access; without it Meta refuses or returns nothing
export const fetchUserProfileName = async ({
  pageAccessToken,
  pageScopedId,
}: {
  pageAccessToken: string;
  pageScopedId: string;
}): Promise<PersonName | undefined> => {
  try {
    const { first_name, last_name } = await graphApiRequest<{
      first_name?: string;
      last_name?: string;
    }>({
      accessToken: pageAccessToken,
      method: 'GET',
      path: pageScopedId,
      query: { fields: 'first_name,last_name' },
    });

    return isNonEmptyString(first_name)
      ? { firstName: first_name, lastName: last_name ?? '' }
      : undefined;
  } catch (error) {
    if (error instanceof GraphApiError) {
      console.warn(`No Messenger profile for ${pageScopedId}: ${error.message}`);

      return undefined;
    }

    throw error;
  }
};
