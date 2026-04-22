import type { EngineerRow } from 'src/modules/engineer/types/engineer-row';
import { chunkedBatchCreate } from 'src/modules/shared/twenty-client';

export async function batchUpsertEngineers(
  items: Array<{
    ghLogin: string;
    name: string;
    githubId: number;
    isCoreTeam?: boolean;
    avatarUrl?: { primaryLinkLabel: string; primaryLinkUrl: string; secondaryLinks: null } | null;
    contributions?: number;
  }>,
): Promise<EngineerRow[]> {
  return chunkedBatchCreate('createEngineers', items, {
    id: true,
    ghLogin: true,
    name: true,
    githubId: true,
    isCoreTeam: true,
    avatarUrl: true,
    contributions: true,
  }) as Promise<EngineerRow[]>;
}
