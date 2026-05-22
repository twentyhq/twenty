import { CoreApiClient } from 'twenty-client-sdk/core';
import { defineLogicFunction } from 'twenty-sdk/define';

export const LIST_AVAILABLE_PARTNERS_LOGIC_FUNCTION_ID =
  '0f91164f-f492-41e8-9bb0-481be5a3d5b9';

type Partner = {
  id: string;
  name: string | null;
  slug: string | null;
  introduction: string | null;
  languagesSpoken: string[] | null;
  deploymentExpertise: string[] | null;
  region: string[] | null;
  calendarLink: { primaryLinkUrl: string | null } | null;
};

type ListAvailablePartnersResult =
  | { ok: true; count: number; partners: Partner[] }
  | { ok: false; reason: string };

const handler = async (): Promise<ListAvailablePartnersResult> => {
  try {
    const client = new CoreApiClient();

    const result = await client.query({
      partners: {
        __args: {
          filter: {
            validationStage: { eq: 'VALIDATED' },
            availability: { eq: 'AVAILABLE' },
          },
          orderBy: [{ name: 'AscNullsLast' }],
          first: 100,
        },
        edges: {
          node: {
            id: true,
            name: true,
            slug: true,
            introduction: true,
            languagesSpoken: true,
            deploymentExpertise: true,
            region: true,
            calendarLink: { primaryLinkUrl: true },
          },
        },
      },
    } as any);

    const partners = (
      (result?.partners?.edges ?? []) as Array<{ node: Partner }>
    ).map((edge) => edge.node);

    return { ok: true, count: partners.length, partners };
  } catch (err) {
    return {
      ok: false,
      reason: err instanceof Error ? err.message : String(err),
    };
  }
};

export default defineLogicFunction({
  universalIdentifier: LIST_AVAILABLE_PARTNERS_LOGIC_FUNCTION_ID,
  name: 'list-available-partners',
  description: 'Returns all partners with validationStage=VALIDATED and availability=AVAILABLE.',
  timeoutSeconds: 10,
  handler,
  httpRouteTriggerSettings: {
    path: '/partners',
    httpMethod: 'GET',
    isAuthRequired: false,
  },
});
