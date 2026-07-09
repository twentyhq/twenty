import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isNewer } from 'src/utils/is-newer.util';

export const updateRelatedCompanyLastInteraction = async (
  client: CoreApiClient,
  personId: string,
  occurredAt: string,
) => {
  const { person } = await client.query({
    person: {
      __args: {
        filter: {
          id: {
            eq: personId,
          }
        }
      },
      companyId: true,
      company: {
        lastInteraction: true,
      }
    }
  });

  if (!person?.companyId || !isNewer(occurredAt, person.company?.lastInteraction)) {
    return;
  }

  await client.mutation({
    updateCompany: {
      __args: {
        id: person.companyId,
        data: {
          lastInteraction: person.company?.lastInteraction,
        },
      },
    },
  });
};
