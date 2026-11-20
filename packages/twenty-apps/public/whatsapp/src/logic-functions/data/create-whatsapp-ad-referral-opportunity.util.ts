import { type CoreApiClient } from 'twenty-client-sdk/core';
import { buildWhatsAppAdReferralOpportunityName } from 'src/logic-functions/data/build-whatsapp-ad-referral-opportunity-name.util';

export const createWhatsAppAdReferralOpportunity = async ({
  client,
  personId,
  adHeadline,
}: {
  client: CoreApiClient;
  personId: string;
  adHeadline: string;
}): Promise<string> => {
  const { person } = await client.query({
    person: {
      __args: { filter: { id: { eq: personId } } },
      name: { firstName: true, lastName: true },
      companyId: true,
    },
  });

  const { createOpportunity } = await client.mutation({
    createOpportunity: {
      __args: {
        data: {
          name: buildWhatsAppAdReferralOpportunityName({ person, adHeadline }),
          pointOfContactId: personId,
          companyId: person?.companyId ?? null,
        },
      },
      id: true,
    },
  });

  return createOpportunity.id;
};
