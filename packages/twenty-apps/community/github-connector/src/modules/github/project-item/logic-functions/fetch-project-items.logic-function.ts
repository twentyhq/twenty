import { defineLogicFunction } from 'twenty-sdk/define';
import { type RoutePayload } from 'twenty-sdk/logic-function';
import { fetchProjectItems } from 'src/modules/github/project-item/graphql/github/fetch-project-items';
import type { ProjectV2Item } from 'src/modules/github/project-item/types/project-v2-item';
import { batchUpsertProjectItems } from 'src/modules/github/project-item/graphql/mutations/batch-upsert';
import { projectItemFromGraphql } from 'src/modules/github/project-item/normalizers';
import { isFixtureAllowed } from 'src/modules/shared/fixtures';

export type FetchProjectItemsFixturePage = {
  items: ProjectV2Item[];
  totalCount: number;
  hasMore: boolean;
  endCursor: string | null;
};

type FetchProjectItemsPayload = {
  owner: string;
  number: number;
  cursor?: string | null;
  fixturePage?: FetchProjectItemsFixturePage;
};

const handler = async (event: RoutePayload<FetchProjectItemsPayload>) => {
  const { owner, number, cursor = null, fixturePage } = event.body ?? {};
  if (!owner || !number) {
    return { error: 'owner and number are required' };
  }

  const result =
    fixturePage && isFixtureAllowed()
      ? fixturePage
      : await fetchProjectItems(owner, number, cursor);
  const { items, totalCount, hasMore, endCursor } = result;

  if (items.length === 0) {
    return { itemCount: 0, totalCount, hasMore: false, endCursor: null };
  }

  const itemData = await Promise.all(items.map(projectItemFromGraphql));

  await batchUpsertProjectItems(itemData);

  return { itemCount: items.length, totalCount, hasMore, endCursor };
};

export default defineLogicFunction({
  universalIdentifier: 'acb300d4-d4ec-491c-b314-3d4db90a49c5',
  name: 'fetch-project-items',
  description:
    'Fetches one page of project items from GitHub Projects V2 GraphQL API and batch upserts them',
  timeoutSeconds: 300,
  handler,
  httpRouteTriggerSettings: {
    path: '/github/fetch-project-items',
    httpMethod: 'POST',
    isAuthRequired: true,
  },
});
