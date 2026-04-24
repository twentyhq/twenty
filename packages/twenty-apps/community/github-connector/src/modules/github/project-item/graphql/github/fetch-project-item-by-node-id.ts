import { githubGraphql } from 'src/modules/github/connector/github-client';
import type { ProjectV2Item } from 'src/modules/github/project-item/types/project-v2-item';
import { PROJECT_V2_ITEM_FRAGMENT } from 'src/modules/github/project-item/graphql/github/fragments';

const QUERY = `
query($id: ID!) {
  node(id: $id) {
    ... on ProjectV2Item {
      ${PROJECT_V2_ITEM_FRAGMENT}
    }
  }
}`;

type Response = {
  node: ProjectV2Item | null;
};

export async function fetchProjectItemByNodeId(
  nodeId: string,
): Promise<ProjectV2Item | null> {
  try {
    const data = await githubGraphql<Response>(QUERY, { id: nodeId });
    return data.node;
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg.includes('Could not resolve') || msg.includes('global id')) {
      return null;
    }
    throw err;
  }
}
