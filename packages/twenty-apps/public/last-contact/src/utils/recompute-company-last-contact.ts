import { type CoreApiClient } from 'twenty-client-sdk/core';

import { executeWithRetry } from 'src/utils/execute-with-retry';

type PersonNode = {
  lastContactAt?: string | null;
  lastContactItemMessage?: { id: string } | null;
  lastContactItemCalendarEvent?: { id: string } | null;
};

// A company's last contact mirrors the most recent contact of any of its people,
// so it must be recomputed whenever that set of people changes rather than only
// when an interaction happens.
export const recomputeCompanyLastContact = async (
  client: CoreApiClient,
  companyId: string,
): Promise<void> => {
  const { people } = await executeWithRetry(() =>
    client.query({
      people: {
        __args: {
          filter: {
            companyId: { eq: companyId },
            lastContactAt: { is: 'NOT_NULL' },
          },
          orderBy: [{ lastContactAt: 'DescNullsLast' }],
          first: 1,
        },
        edges: {
          node: {
            lastContactAt: true,
            lastContactItemMessage: { id: true },
            lastContactItemCalendarEvent: { id: true },
          },
        },
      },
    }),
  );

  const topPerson = (people?.edges?.[0]?.node as PersonNode | undefined) ?? {};

  await executeWithRetry(() =>
    client.mutation({
      updateCompany: {
        __args: {
          id: companyId,
          data: {
            lastContactAt: topPerson.lastContactAt ?? null,
            lastContactItemMessageId:
              topPerson.lastContactItemMessage?.id ?? null,
            lastContactItemCalendarEventId:
              topPerson.lastContactItemCalendarEvent?.id ?? null,
          },
        },
        id: true,
      },
    }),
  );
};

export const recomputeCompaniesLastContact = async (
  client: CoreApiClient,
  companyIds: string[],
): Promise<void> => {
  for (const companyId of companyIds) {
    await recomputeCompanyLastContact(client, companyId);
  }
};
