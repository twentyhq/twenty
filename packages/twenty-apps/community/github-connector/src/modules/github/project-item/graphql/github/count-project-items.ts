import { githubGraphqlOptional } from 'src/modules/github/connector/github-client';

const ORG_QUERY = `
query($owner: String!, $number: Int!) {
  organization(login: $owner) {
    projectV2(number: $number) {
      items { totalCount }
    }
  }
}`;

const USER_QUERY = ORG_QUERY.replace(
  'organization(login: $owner)',
  'user(login: $owner)',
);

type OrgResponse = {
  organization: { projectV2: { items: { totalCount: number } } | null } | null;
};

type UserResponse = {
  user: { projectV2: { items: { totalCount: number } } | null } | null;
};

export async function countProjectItems(
  owner: string,
  projectNumber: number,
): Promise<number> {
  const orgData = await githubGraphqlOptional<OrgResponse>(ORG_QUERY, {
    owner,
    number: projectNumber,
  });
  const orgCount = orgData?.organization?.projectV2?.items.totalCount;
  if (typeof orgCount === 'number') return orgCount;

  const userData = await githubGraphqlOptional<UserResponse>(USER_QUERY, {
    owner,
    number: projectNumber,
  });
  return userData?.user?.projectV2?.items.totalCount ?? 0;
}
