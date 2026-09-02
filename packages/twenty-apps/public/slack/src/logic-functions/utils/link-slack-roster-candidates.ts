import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { SLACK_USER_LINK_SOURCE } from 'src/logic-functions/constants/slack-user-link-source';
import { createSlackUserLinks } from 'src/logic-functions/data/create-slack-user-links';
import { destroySlackUserLinks } from 'src/logic-functions/data/destroy-slack-user-links';
import { findDeletedSlackUserLinkIds } from 'src/logic-functions/data/find-deleted-slack-user-link-ids';
import { listLinkedSlackUserIds } from 'src/logic-functions/data/list-linked-slack-user-ids';
import { type SlackRosterMatchCandidate } from 'src/logic-functions/types/slack-roster-match.type';
import { type SlackUserLinkDraft } from 'src/logic-functions/types/slack-user-link-draft.type';
import { persistSlackUserLink } from 'src/logic-functions/utils/persist-slack-user-link';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const CANDIDATES_PER_CREATE = 200;

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

const linkCandidateOneByOne = async (
  client: CoreApiClient,
  {
    candidates,
    slackTeamId,
  }: { candidates: SlackRosterMatchCandidate[]; slackTeamId: string },
): Promise<SlackRosterLinkOutcome> => {
  const alreadyLinkedSlackUserIds = await listLinkedSlackUserIds(client, {
    slackTeamId,
    slackUserIds: candidates.map((candidate) => candidate.slackUserId),
  });

  const outcomes = [];

  for (const candidate of candidates) {
    if (alreadyLinkedSlackUserIds.has(candidate.slackUserId)) {
      outcomes.push(true);
      continue;
    }

    try {
      await persistSlackUserLink(client, {
        existingLink: undefined,
        isSameMemberRelink: false,
        slackTeamId,
        slackUserId: candidate.slackUserId,
        workspaceMemberId: candidate.workspaceMemberId,
        name: candidate.displayName,
        source: SLACK_USER_LINK_SOURCE.AUTO,
        consentState: SLACK_USER_LINK_CONSENT_STATE.ACTIVE,
      });
      outcomes.push(true);
    } catch (error) {
      console.warn(
        `[slack] roster match could not link ${candidate.slackUserId}: ${toErrorMessage(error)}`,
      );
      outcomes.push(false);
    }
  }

  return {
    linkedCount: outcomes.filter((isLinked) => isLinked).length,
    failedCount: outcomes.filter((isLinked) => !isLinked).length,
  };
};

const linkCandidateBatch = async (
  client: CoreApiClient,
  {
    candidates,
    slackTeamId,
  }: { candidates: SlackRosterMatchCandidate[]; slackTeamId: string },
): Promise<SlackRosterLinkOutcome> => {
  try {
    await createSlackUserLinks(client, {
      drafts: candidates.map((candidate) =>
        toSlackUserLinkDraft({ candidate, slackTeamId }),
      ),
    });

    return { linkedCount: candidates.length, failedCount: 0 };
  } catch (error) {
    console.warn(
      `[slack] roster match batch failed, linking one at a time: ${toErrorMessage(error)}`,
    );

    return linkCandidateOneByOne(client, { candidates, slackTeamId });
  }
};

export const linkSlackRosterCandidates = async (
  client: CoreApiClient,
  {
    candidates,
    slackTeamId,
  }: { candidates: SlackRosterMatchCandidate[]; slackTeamId: string },
): Promise<SlackRosterLinkOutcome> => {
  if (candidates.length === 0) {
    return { linkedCount: 0, failedCount: 0 };
  }

  const deletedLinkIds = await findDeletedSlackUserLinkIds(client, {
    slackTeamId,
    slackUserIds: candidates.map((candidate) => candidate.slackUserId),
  });

  if (deletedLinkIds.length > 0) {
    await destroySlackUserLinks(client, { ids: deletedLinkIds });
  }

  const batchOutcomes: SlackRosterLinkOutcome[] = [];

  for (
    let batchStart = 0;
    batchStart < candidates.length;
    batchStart += CANDIDATES_PER_CREATE
  ) {
    batchOutcomes.push(
      await linkCandidateBatch(client, {
        candidates: candidates.slice(
          batchStart,
          batchStart + CANDIDATES_PER_CREATE,
        ),
        slackTeamId,
      }),
    );
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
