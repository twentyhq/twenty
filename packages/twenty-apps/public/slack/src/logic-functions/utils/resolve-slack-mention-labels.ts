import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_MENTION_LABEL } from 'src/logic-functions/constants/slack-assistant-mention-label';
import { findSlackUserLinksBySlackUserIds } from 'src/logic-functions/data/find-slack-user-links-by-slack-user-ids';
import { findWorkspaceMemberIdsByEmails } from 'src/logic-functions/data/find-workspace-member-ids-by-emails';
import { findWorkspaceMemberNamesByIds } from 'src/logic-functions/data/find-workspace-member-names-by-ids';
import { type SlackMentionLabel } from 'src/logic-functions/types/slack-mention-label.type';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { type SlackUserLinkSummary } from 'src/logic-functions/types/slack-user-link-summary.type';
import { fetchSlackUserIdentity } from 'src/logic-functions/utils/fetch-slack-user-identity';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { isLinkableSlackIdentity } from 'src/logic-functions/utils/is-linkable-slack-identity';
import { isManualConsentedSlackUserLink } from 'src/logic-functions/utils/is-manual-consented-slack-user-link';

const MAX_MENTIONED_USERS = 20;
const MAX_SLACK_USER_LOOKUPS = 8;
const MAX_MENTION_NAME_LENGTH = 80;
const LABEL_SUFFIX_FORGING_CHARACTERS_PATTERN = /[()]/g;

const sanitizeMentionName = (name: string | undefined): string | undefined => {
  const flattened = (name ?? '')
    .replace(LABEL_SUFFIX_FORGING_CHARACTERS_PATTERN, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_MENTION_NAME_LENGTH)
    .trim();

  return isNonEmptyString(flattened) ? flattened : undefined;
};

const formatWorkspaceMemberLabel = ({
  name,
  workspaceMemberId,
}: {
  name: string;
  workspaceMemberId: string;
}): string => `@${name} (workspace member ${workspaceMemberId})`;

const formatUnconfirmedLabel = (name: string): string =>
  `@${name} (membership not confirmed)`;

const formatUnknownLabel = (slackUserId: string): string =>
  `@unknown Slack user ${slackUserId}`;

const fetchSlackIdentities = async ({
  slackClient,
  slackUserIds,
}: {
  slackClient: WebClient;
  slackUserIds: string[];
}): Promise<Map<string, SlackUserIdentity>> => {
  const identities = await Promise.all(
    slackUserIds
      .slice(0, MAX_SLACK_USER_LOOKUPS)
      .map((slackUserId) =>
        fetchSlackUserIdentity({ client: slackClient, slackUserId }),
      ),
  );

  return new Map(
    identities
      .filter(isDefined)
      .map((identity) => [identity.slackUserId, identity]),
  );
};

const groupSlackUserIdsByTeamId = (
  identityBySlackUserId: ReadonlyMap<string, SlackUserIdentity>,
): Map<string, string[]> => {
  const slackUserIdsBySlackTeamId = new Map<string, string[]>();

  for (const identity of identityBySlackUserId.values()) {
    if (!isNonEmptyString(identity.slackTeamId)) {
      continue;
    }

    slackUserIdsBySlackTeamId.set(identity.slackTeamId, [
      ...(slackUserIdsBySlackTeamId.get(identity.slackTeamId) ?? []),
      identity.slackUserId,
    ]);
  }

  return slackUserIdsBySlackTeamId;
};

// Mirrors resolveSlackRunAsWorkspaceMemberId: a hand-picked consented link is
// authoritative, anything else has to re-earn its member from the account's
// live verified email, so a stale row cannot name the wrong assignee.
const resolveTrustedWorkspaceMemberId = ({
  identity,
  link,
  installedSlackTeamId,
  workspaceMemberIdByEmail,
}: {
  identity: SlackUserIdentity | undefined;
  link: SlackUserLinkSummary | undefined;
  installedSlackTeamId: string | undefined;
  workspaceMemberIdByEmail: ReadonlyMap<string, string>;
}): string | undefined => {
  if (isDefined(link) && isManualConsentedSlackUserLink(link)) {
    return link.workspaceMemberId;
  }


  if (!isLinkableSlackIdentity({ identity, installedSlackTeamId })) {
    return undefined;
  }

  return workspaceMemberIdByEmail.get((identity?.email ?? '').toLowerCase());
};

export const resolveSlackMentionLabels = async ({
  slackUserIds,
  client,
  slackClient,
  assistantBotUserId,
}: {
  slackUserIds: string[];
  client: CoreApiClient;
  slackClient: WebClient | undefined;
  assistantBotUserId: string | undefined;
}): Promise<Map<string, SlackMentionLabel>> => {
  const labelBySlackUserId = new Map<string, SlackMentionLabel>();
  const mentionedUserIds: string[] = [];

  for (const slackUserId of slackUserIds) {
    if (slackUserId === assistantBotUserId) {
      labelBySlackUserId.set(slackUserId, {
        label: SLACK_ASSISTANT_MENTION_LABEL,
        name: undefined,
      });
      continue;
    }

    if (mentionedUserIds.length < MAX_MENTIONED_USERS) {
      mentionedUserIds.push(slackUserId);
    }

    labelBySlackUserId.set(slackUserId, {
      label: formatUnknownLabel(slackUserId),
      name: undefined,
    });
  }

  if (mentionedUserIds.length === 0 || !isDefined(slackClient)) {
    return labelBySlackUserId;
  }

  const [installedSlackTeamId, identityBySlackUserId] = await Promise.all([
    getInstalledSlackTeamId(slackClient),
    fetchSlackIdentities({ slackClient, slackUserIds: mentionedUserIds }),
  ]);

  const linkBySlackUserId = await findSlackUserLinksBySlackUserIds(client, {
    slackUserIdsBySlackTeamId: groupSlackUserIdsByTeamId(identityBySlackUserId),
  });

  const revalidatedEmails = [...identityBySlackUserId.values()]
    .filter(
      (identity) =>
        !isManualConsentedSlackUserLink(
          linkBySlackUserId.get(identity.slackUserId) ?? {
            source: undefined,
            consentState: undefined,
          },
        ) && isLinkableSlackIdentity({ identity, installedSlackTeamId }),
    )
    .map((identity) => identity.email)
    .filter(isNonEmptyString);

  const { workspaceMemberIdByEmail } = await findWorkspaceMemberIdsByEmails(
    client,
    { emails: revalidatedEmails },
  );

  const workspaceMemberIdBySlackUserId = new Map<string, string>();

  for (const slackUserId of mentionedUserIds) {
    const workspaceMemberId = resolveTrustedWorkspaceMemberId({
      identity: identityBySlackUserId.get(slackUserId),
      link: linkBySlackUserId.get(slackUserId),
      installedSlackTeamId,
      workspaceMemberIdByEmail,
    });

    if (isNonEmptyString(workspaceMemberId)) {
      workspaceMemberIdBySlackUserId.set(slackUserId, workspaceMemberId);
    }
  }

  const nameByWorkspaceMemberId = await findWorkspaceMemberNamesByIds(client, {
    workspaceMemberIds: [...new Set(workspaceMemberIdBySlackUserId.values())],
  });

  for (const slackUserId of mentionedUserIds) {
    const slackName = sanitizeMentionName(
      identityBySlackUserId.get(slackUserId)?.displayName ??
        linkBySlackUserId.get(slackUserId)?.name,
    );

    const workspaceMemberId = workspaceMemberIdBySlackUserId.get(slackUserId);

    // A member id whose record is gone is worse to hand over than no id, so it
    // degrades to the unconfirmed label rather than naming a dead record.
    if (
      isNonEmptyString(workspaceMemberId) &&
      nameByWorkspaceMemberId.has(workspaceMemberId)
    ) {
      const name =
        sanitizeMentionName(nameByWorkspaceMemberId.get(workspaceMemberId)) ??
        slackName ??
        `Slack user ${slackUserId}`;

      labelBySlackUserId.set(slackUserId, {
        label: formatWorkspaceMemberLabel({ name, workspaceMemberId }),
        name,
      });
      continue;
    }

    if (isNonEmptyString(slackName)) {
      labelBySlackUserId.set(slackUserId, {
        label: formatUnconfirmedLabel(slackName),
        name: slackName,
      });
    }
  }

  return labelBySlackUserId;
};
