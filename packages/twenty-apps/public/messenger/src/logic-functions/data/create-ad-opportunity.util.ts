import { type CoreApiClient } from 'twenty-client-sdk/core';

import { buildAdOpportunityName } from 'src/logic-functions/data/build-ad-opportunity-name.util';

export const createAdOpportunity = async ({
  client,
  personId,
  adTitle,
}: {
  client: CoreApiClient;
  personId: string;
  adTitle: string | undefined;
}) => {
  const { person } = await client.query({
    person: {
      __args: { filter: { id: { eq: personId } } },
      name: { firstName: true, lastName: true },
      companyId: true,
    },
  });

  await client.mutation({
    createOpportunity: {
      __args: {
        data: {
          name: buildAdOpportunityName({
            personName: person?.name ?? null,
            adTitle,
          }),
          pointOfContactId: personId,
          companyId: person?.companyId ?? null,
        },
      },
      id: true,
    },
  });
};
