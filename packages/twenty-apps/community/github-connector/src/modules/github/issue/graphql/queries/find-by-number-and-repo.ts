import { getClient } from 'src/modules/shared/twenty-client';
import type { IssueRow } from 'src/modules/github/issue/types/issue-row';

export async function findIssueByNumberAndRepo(
  githubNumber: number,
  repo: string,
): Promise<IssueRow | null> {
  const client = getClient();
  const res = await client.query({
    issues: {
      __args: {
        filter: {
          and: [
            { githubNumber: { eq: githubNumber } },
            { repo: { eq: repo } },
          ],
        },
        first: 1,
      },
      edges: {
        node: {
          id: true,
          title: true,
          githubNumber: true,
          uniqueIdentifier: true,
          githubUrl: { primaryLinkLabel: true, primaryLinkUrl: true },
          state: true,
          labels: true,
          githubCreatedAt: true,
          closedAt: true,
          repo: true,
          authorId: true,
        },
      },
    },
  });

  const node = res.issues?.edges?.[0]?.node;
  return (node as IssueRow | undefined) ?? null;
}
