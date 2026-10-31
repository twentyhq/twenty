import { CoreApiClient } from 'twenty-client-sdk/core';

import { UNLINKED_PERSON_FILTER } from 'src/logic-functions/utils/unlinked-person-filter.constant';

export const setUnlinkedPersonLinkedinLink = async ({
  personId,
  handle,
}: {
  personId: string;
  handle: string;
}): Promise<boolean> => {
  const { updatePeople } = await new CoreApiClient({
    runAs: 'application',
  }).mutation({
    updatePeople: {
      __args: {
        filter: { and: [{ id: { eq: personId } }, UNLINKED_PERSON_FILTER] },
        data: { linkedinLink: { primaryLinkUrl: handle } },
      },
      id: true,
    },
  });

  return (updatePeople ?? []).length > 0;
};
