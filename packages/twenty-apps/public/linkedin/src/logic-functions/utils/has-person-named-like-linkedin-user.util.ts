import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { buildPersonNameFilter } from 'src/logic-functions/utils/build-person-name-filter.util';
import { splitLinkedinUserName } from 'src/logic-functions/utils/split-linkedin-user-name.util';
import { type UnipileUser } from 'src/unipile/types/unipile-user.type';

export const hasPersonNamedLikeLinkedinUser = async (
  user: Pick<UnipileUser, 'display_name' | 'first_name' | 'last_name'>,
): Promise<boolean> => {
  const { firstName, lastName } = splitLinkedinUserName(user);

  if (!isNonEmptyString(firstName) || !isNonEmptyString(lastName)) {
    return true;
  }

  const { people } = await new CoreApiClient({ runAs: 'application' }).query({
    people: {
      __args: {
        filter: buildPersonNameFilter({ firstName, lastName }),
        first: 1,
      },
      edges: { node: { id: true } },
    },
  });

  return (people?.edges ?? []).length > 0;
};
