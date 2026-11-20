import { type CoreApiClient } from 'twenty-client-sdk/core';

export const findPersonIdsByWhatsappIds = async ({
  client,
  whatsAppIds,
}: {
  client: CoreApiClient;
  whatsAppIds: string[];
}): Promise<Map<string, string>> => {
  if (whatsAppIds.length === 0) {
    return new Map();
  }

  const { people } = await client.query({
    people: {
      __args: {
        filter: { whatsAppId: { in: whatsAppIds } },
        first: whatsAppIds.length,
      },
      edges: { node: { id: true, whatsAppId: true } },
    },
  });

  return new Map(
    (people?.edges ?? []).map(
      ({ node }: { node: { id: string; whatsAppId: string } }) => [node.whatsAppId, node.id],
    ),
  );
};
