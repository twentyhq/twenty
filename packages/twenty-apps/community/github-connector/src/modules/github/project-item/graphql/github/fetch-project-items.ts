import {
  EMPTY_PAGE,
  type GithubPage,
  githubGraphqlOptional,
} from 'src/modules/github/connector/github-client';
import type { ProjectV2Item } from 'src/modules/github/project-item/types/project-v2-item';
import { PROJECT_V2_ITEM_FRAGMENT } from 'src/modules/github/project-item/graphql/github/fragments';

const ORG_QUERY = `
query($owner: String!, $number: Int!, $cursor: String) {
  organization(login: $owner) {
    projectV2(number: $number) {
      items(first: 100, after: $cursor) {
        totalCount
        pageInfo { hasNextPage endCursor }
        nodes { ${PROJECT_V2_ITEM_FRAGMENT} }
      }
    }
  }
}`;

const USER_QUERY = ORG_QUERY.replace(
  'organization(login: $owner)',
  'user(login: $owner)',
);

type ItemsConnection = GithubPage<ProjectV2Item>;

type OrgResponse = {
  organization: { projectV2: { items: ItemsConnection } | null } | null;
};

type UserResponse = {
  user: { projectV2: { items: ItemsConnection } | null } | null;
};

export async function fetchProjectItems(
  owner: string,
  projectNumber: number,
  cursor: string | null = null,
): Promise<{
  items: ProjectV2Item[];
  totalCount: number;
  hasMore: boolean;
  endCursor: string | null;
}> {
  const orgData = await githubGraphqlOptional<OrgResponse>(ORG_QUERY, {
    owner,
    number: projectNumber,
    cursor,
  });

  let conn: ItemsConnection | undefined =
    orgData?.organization?.projectV2?.items;

  if (!conn) {
    const userData = await githubGraphqlOptional<UserResponse>(USER_QUERY, {
      owner,
      number: projectNumber,
      cursor,
    });
    conn = userData?.user?.projectV2?.items;
  }

  if (!conn) {
    console.warn(
      `[github-gql] project ${owner}/${projectNumber} returned no items (project does not exist or the fine-grained PAT lacks Organization → Projects: Read for "${owner}", and may also need to be approved by an org admin).`,
    );
    return { items: [], ...EMPTY_PAGE };
  }

  return {
    items: conn.nodes,
    totalCount: conn.totalCount,
    hasMore: conn.pageInfo.hasNextPage,
    endCursor: conn.pageInfo.endCursor,
  };
}
