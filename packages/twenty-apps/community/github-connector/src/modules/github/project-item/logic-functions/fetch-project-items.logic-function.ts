import { defineLogicFunction, type RoutePayload } from 'twenty-sdk/define';
import { fetchProjectItemsPage } from 'src/modules/github/connector/graphql';
import type { ProjectV2Item } from 'src/modules/github/connector/types';
import { batchUpsertProjectItems } from 'src/modules/github/project-item/graphql/mutations/batch-upsert';
import { projectItemFromGraphql } from 'src/modules/github/project-item/normalizers';

export type FetchProjectItemsFixturePage = {
  items: ProjectV2Item[];
  totalCount: number;
  hasMore: boolean;
  endCursor: string | null;
};

type FetchProjectItemsPayload = {
  org: string;
  projectNumber: number;
  cursor?: string | null;
  fixturePage?: FetchProjectItemsFixturePage;
};

const handler = async (event: RoutePayload<FetchProjectItemsPayload>) => {
  const { org, projectNumber, cursor = null, fixturePage } = event.body ?? {};
  if (!org || !projectNumber) {
    return { error: 'org and projectNumber are required' };
  }

  const result = fixturePage
    ?? (await fetchProjectItemsPage(org, projectNumber, cursor));
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
