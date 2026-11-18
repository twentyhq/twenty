import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { TEAMS_USER_LINK_SOURCE } from 'src/features/chat/logic-functions/constants/teams-user-link-source';
import { createTeamsUserLink } from 'src/features/chat/logic-functions/data/create-teams-user-link';
import { createTeamsUserLinks } from 'src/features/chat/logic-functions/data/create-teams-user-links';
import { type TeamsDirectoryMatchCandidate } from 'src/features/chat/logic-functions/types/teams-directory-match.type';
import { type TeamsUserLinkDraft } from 'src/features/chat/logic-functions/types/teams-user-link-draft.type';
import { isDuplicateRecordError } from 'src/features/chat/logic-functions/utils/is-duplicate-record-error';
import { toErrorMessage } from 'src/utils/to-error-message';

const LINKS_PER_BATCH = 200;

const MAX_ONE_BY_ONE_RETRIES = LINKS_PER_BATCH;

type TeamsDirectoryLinkOutcome = {
  linkedCount: number;
  failedCount: number;
};

const toTeamsUserLinkDraft = ({
  candidate,
  teamsTenantId,
}: {
  candidate: TeamsDirectoryMatchCandidate;
  teamsTenantId: string;
}): TeamsUserLinkDraft => ({
  teamsTenantId,
  teamsUserAadObjectId: candidate.teamsUserAadObjectId,
  workspaceMemberId: candidate.workspaceMemberId,
  name: isNonEmptyString(candidate.displayName)
    ? candidate.displayName
    : candidate.teamsUserAadObjectId,
  source: TEAMS_USER_LINK_SOURCE.AUTO,
});

const createCandidatesOneByOne = async ({
  client,
  candidates,
  teamsTenantId,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  candidates: TeamsDirectoryMatchCandidate[];
  teamsTenantId: string;
}): Promise<TeamsDirectoryLinkOutcome> => {
  let linkedCount = 0;

  for (const candidate of candidates) {
    try {
      await createTeamsUserLink({
        client,
        ...toTeamsUserLinkDraft({ candidate, teamsTenantId }),
      });
      linkedCount += 1;
    } catch (error) {
      if (isDuplicateRecordError(error)) {
        linkedCount += 1;
        continue;
      }

      console.warn(
        `[teams] directory match could not link ${candidate.teamsUserAadObjectId}: ${toErrorMessage(error)}`,
      );
    }
  }

  return { linkedCount, failedCount: candidates.length - linkedCount };
};

export const linkTeamsDirectoryCandidates = async ({
  client,
  candidates,
  teamsTenantId,
}: {
  client: Pick<CoreApiClient, 'mutation'>;
  candidates: TeamsDirectoryMatchCandidate[];
  teamsTenantId: string;
}): Promise<TeamsDirectoryLinkOutcome> => {
  const outcome: TeamsDirectoryLinkOutcome = { linkedCount: 0, failedCount: 0 };
  let remainingOneByOneRetries = MAX_ONE_BY_ONE_RETRIES;

  for (
    let batchStart = 0;
    batchStart < candidates.length;
    batchStart += LINKS_PER_BATCH
  ) {
    const batchCandidates = candidates.slice(
      batchStart,
      batchStart + LINKS_PER_BATCH,
    );

    try {
      await createTeamsUserLinks({
        client,
        drafts: batchCandidates.map((candidate) =>
          toTeamsUserLinkDraft({ candidate, teamsTenantId }),
        ),
      });
      outcome.linkedCount += batchCandidates.length;
      continue;
    } catch (error) {
      console.warn(
        `[teams] directory match batch of ${batchCandidates.length} failed: ${toErrorMessage(error)}`,
      );
    }

    if (remainingOneByOneRetries < batchCandidates.length) {
      outcome.failedCount += batchCandidates.length;
      continue;
    }

    remainingOneByOneRetries -= batchCandidates.length;

    const retryOutcome = await createCandidatesOneByOne({
      client,
      candidates: batchCandidates,
      teamsTenantId,
    });

    outcome.linkedCount += retryOutcome.linkedCount;
    outcome.failedCount += retryOutcome.failedCount;
  }

  return outcome;
};
