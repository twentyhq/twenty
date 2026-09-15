import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { createSlackUserLink } from 'src/logic-functions/data/create-slack-user-link';
import { createSlackUserLinks } from 'src/logic-functions/data/create-slack-user-links';
import { destroySlackUserLinks } from 'src/logic-functions/data/destroy-slack-user-links';
import { findDeletedSlackUserLinkIds } from 'src/logic-functions/data/find-deleted-slack-user-link-ids';
import { listLinkedSlackUserIds } from 'src/logic-functions/data/list-linked-slack-user-ids';
import { type SlackRosterMatchCandidate } from 'src/logic-functions/types/slack-roster-match.type';
import { type SlackUserLinkDraft } from 'src/logic-functions/types/slack-user-link-draft.type';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const CORE_API_QUERY_MAX_RECORDS = 200;

const MAX_FALLBACK_CANDIDATES = CORE_API_QUERY_MAX_RECORDS;

type SlackRosterLinkOutcome = {
  linkedCount: number;
  failedCount: number;
};

const toSlackUserLinkDraft = ({
  candidate,
  slackTeamId,
}: {
  candidate: SlackRosterMatchCandidate;
  slackTeamId: string;
}): SlackUserLinkDraft => ({
  slackTeamId,
  slackUserId: candidate.slackUserId,
  workspaceMemberId: candidate.workspaceMemberId,
  name: isNonEmptyString(candidate.displayName)
    ? candidate.displayName
    : candidate.slackUserId,
  source: SLACK_USER_LINK_SOURCE.AUTO,
  consentState: SLACK_USER_LINK_CONSENT_STATE.ACTIVE,
});

const clearSoftDeletedLinks = async (
  client: CoreApiClient,
  {
    candidates,
    slackTeamId,
  }: { candidates: SlackRosterMatchCandidate[]; slackTeamId: string },
): Promise<void> => {
  const deletedLinkIds = await findDeletedSlackUserLinkIds(client, {
    slackTeamId,
    slackUserIds: candidates.map((candidate) => candidate.slackUserId),
  });

  if (deletedLinkIds.length > 0) {
    await destroySlackUserLinks(client, { ids: deletedLinkIds });
  }
};

const dedupeCandidatesBySlackUserId = (
  candidates: SlackRosterMatchCandidate[],
): SlackRosterMatchCandidate[] => [
  ...new Map(
    candidates.map((candidate) => [candidate.slackUserId, candidate]),
  ).values(),
];

const partitionWrittenCandidates = async (
  client: CoreApiClient,
  {
    candidates,
    slackTeamId,
  }: { candidates: SlackRosterMatchCandidate[]; slackTeamId: string },
): Promise<{
  writtenCount: number;
  unwrittenCandidates: SlackRosterMatchCandidate[];
}> => {
  const alreadyLinkedSlackUserIds = await listLinkedSlackUserIds(client, {
    slackTeamId,
    slackUserIds: candidates.map((candidate) => candidate.slackUserId),
  });

  const unwrittenCandidates = candidates.filter(
    (candidate) => !alreadyLinkedSlackUserIds.has(candidate.slackUserId),
  );

  return {
    writtenCount: candidates.length - unwrittenCandidates.length,
    unwrittenCandidates,
  };
};

const createCandidatesOneByOne = async (
  client: CoreApiClient,
  {
    candidates,
    slackTeamId,
  }: { candidates: SlackRosterMatchCandidate[]; slackTeamId: string },
): Promise<number> => {
  const outcomes: boolean[] = [];

  for (const candidate of candidates) {
    try {
      await createSlackUserLink(
        client,
        toSlackUserLinkDraft({ candidate, slackTeamId }),
      );
      outcomes.push(true);
    } catch (error) {
      console.warn(
        `[slack] roster match could not link ${candidate.slackUserId}: ${toErrorMessage(error)}`,
      );
      outcomes.push(false);
    }
  }

  return outcomes.filter((isLinked) => isLinked).length;
};

const recoverFailedBatch = async (
  client: CoreApiClient,
  {
    candidates,
    slackTeamId,
    canRetryOneByOne,
  }: {
    candidates: SlackRosterMatchCandidate[];
    slackTeamId: string;
    canRetryOneByOne: boolean;
  },
): Promise<SlackRosterLinkOutcome> => {
  try {
    const { writtenCount, unwrittenCandidates } =
      await partitionWrittenCandidates(client, {
        candidates,
        slackTeamId,
      });

    if (!canRetryOneByOne) {
      return {
        linkedCount: writtenCount,
        failedCount: unwrittenCandidates.length,
      };
    }

    const createdCount = await createCandidatesOneByOne(client, {
      candidates: unwrittenCandidates,
      slackTeamId,
    });

    return {
      linkedCount: writtenCount + createdCount,
      failedCount: unwrittenCandidates.length - createdCount,
    };
  } catch (error) {
    console.warn(
      `[slack] roster match could not reconcile a failed batch of ${candidates.length}: ${toErrorMessage(error)}`,
    );

    return { linkedCount: 0, failedCount: candidates.length };
  }
};

export const linkSlackRosterCandidates = async (
  client: CoreApiClient,
  {
    candidates,
    slackTeamId,
  }: { candidates: SlackRosterMatchCandidate[]; slackTeamId: string },
): Promise<SlackRosterLinkOutcome> => {
  const uniqueCandidates = dedupeCandidatesBySlackUserId(candidates);

  if (uniqueCandidates.length === 0) {
    return { linkedCount: 0, failedCount: 0 };
  }

  const batchOutcomes: SlackRosterLinkOutcome[] = [];
  let remainingFallbackCandidates = MAX_FALLBACK_CANDIDATES;

  for (
    let batchStart = 0;
    batchStart < uniqueCandidates.length;
    batchStart += CORE_API_QUERY_MAX_RECORDS
  ) {
    const batchCandidates = uniqueCandidates.slice(
      batchStart,
      batchStart + CORE_API_QUERY_MAX_RECORDS,
    );

    try {
      await clearSoftDeletedLinks(client, {
        candidates: batchCandidates,
        slackTeamId,
      });
    } catch (error) {
      console.warn(
        `[slack] roster match could not clear the soft-deleted links of ${batchCandidates.length} candidates: ${toErrorMessage(error)}`,
      );

      batchOutcomes.push(
        await recoverFailedBatch(client, {
          candidates: batchCandidates,
          slackTeamId,
          canRetryOneByOne: false,
        }),
      );
      continue;
    }

    try {
      await createSlackUserLinks(client, {
        drafts: batchCandidates.map((candidate) =>
          toSlackUserLinkDraft({ candidate, slackTeamId }),
        ),
      });

      batchOutcomes.push({
        linkedCount: batchCandidates.length,
        failedCount: 0,
      });
    } catch (error) {
      console.warn(
        `[slack] roster match batch of ${batchCandidates.length} failed: ${toErrorMessage(error)}`,
      );

      const canRetryOneByOne =
        remainingFallbackCandidates >= batchCandidates.length;

      if (canRetryOneByOne) {
        remainingFallbackCandidates -= batchCandidates.length;
      }

      batchOutcomes.push(
        await recoverFailedBatch(client, {
          candidates: batchCandidates,
          slackTeamId,
          canRetryOneByOne,
        }),
      );
    }
  }

  return {
    linkedCount: batchOutcomes.reduce(
      (total, outcome) => total + outcome.linkedCount,
      0,
    ),
    failedCount: batchOutcomes.reduce(
      (total, outcome) => total + outcome.failedCount,
      0,
    ),
  };
};
