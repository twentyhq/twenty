import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { getClient } from 'src/modules/shared/twenty-client';

type SearchContributorsPayload = {
  query?: string;
  limit?: number;
};

type EngineerResult = {
  id: string;
  name: string | null;
  ghLogin: string | null;
  avatarUrl: string | null;
};

type SearchContributorsResponse = {
  engineers: EngineerResult[];
};

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

const handler = async (
  event: RoutePayload<SearchContributorsPayload>,
): Promise<SearchContributorsResponse> => {
  const rawQuery = (event.body?.query ?? '').trim();
  const limit = Math.min(
    Math.max(event.body?.limit ?? DEFAULT_LIMIT, 1),
    MAX_LIMIT,
  );

  const client = getClient();

  const filter =
    rawQuery.length === 0
      ? undefined
      : {
          or: [
            { name: { ilike: `%${rawQuery}%` } },
            { ghLogin: { ilike: `%${rawQuery}%` } },
          ],
        };

  const res = await client.query({
    engineers: {
      __args: {
        ...(filter ? { filter } : {}),
        orderBy: [{ name: 'AscNullsLast' }],
        first: limit,
      },
      edges: {
        node: {
          id: true,
          name: true,
          ghLogin: true,
          avatarUrl: { primaryLinkUrl: true },
        },
      },
    },
  });

  type Node = {
    id: string;
    name: string | null;
    ghLogin: string | null;
    avatarUrl: { primaryLinkUrl: string | null } | null;
  };

  const edges =
    (res.engineers as { edges?: { node: Node }[] } | undefined)?.edges ?? [];

  const engineers: EngineerResult[] = edges.map((e) => ({
    id: e.node.id,
    name: e.node.name ?? null,
    ghLogin: e.node.ghLogin ?? null,
    avatarUrl: e.node.avatarUrl?.primaryLinkUrl ?? null,
  }));

  return { engineers };
};

export default defineLogicFunction({
  universalIdentifier: 'b4d8f2a7-3e58-4f9b-ac1d-8f7e2b3c4d5e',
  name: 'search-contributors',
  description:
    'Searches engineers (contributors) by name or GitHub login for use in front-end pickers.',
  timeoutSeconds: 15,
  handler,
  httpRouteTriggerSettings: {
    path: '/contributors/search',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
