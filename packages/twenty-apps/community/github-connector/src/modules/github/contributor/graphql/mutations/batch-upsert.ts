import type { ContributorRow } from 'src/modules/github/contributor/types/contributor-row';
import { chunkedBatchCreate } from 'src/modules/shared/twenty-client';

export async function batchUpsertContributors(
  items: Array<{
    ghLogin: string;
    name: string;
    githubId: number;
    avatarUrl?: { primaryLinkLabel: string; primaryLinkUrl: string; secondaryLinks: null } | null;
    contributions?: number;
  }>,
): Promise<ContributorRow[]> {
  return chunkedBatchCreate('createContributors', items, {
    id: true,
    ghLogin: true,
    name: true,
    githubId: true,
    avatarUrl: true,
    contributions: true,
  }) as Promise<ContributorRow[]>;
}
