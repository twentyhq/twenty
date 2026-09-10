import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_MENTION_LABEL } from 'src/logic-functions/constants/slack-assistant-mention-label';
import { findSlackUserLinksBySlackUserIds } from 'src/logic-functions/data/find-slack-user-links-by-slack-user-ids';
import { findWorkspaceMemberNamesByIds } from 'src/logic-functions/data/find-workspace-member-names-by-ids';
import { type SlackMentionLabel } from 'src/logic-functions/types/slack-mention-label.type';
import { type SlackUserLinkSummary } from 'src/logic-functions/types/slack-user-link-summary.type';
import { fetchSlackUserIdentity } from 'src/logic-functions/utils/fetch-slack-user-identity';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { isConsentedSlackUserLink } from 'src/logic-functions/utils/is-consented-slack-user-link';

const MAX_MENTIONED_USERS = 20;
const MAX_SLACK_USER_LOOKUPS = 8;
const MAX_MENTION_NAME_LENGTH = 80;
const LABEL_SUFFIX_FORGING_CHARACTERS_PATTERN = /[()]/g;

const sanitizeMentionName = (name: string): string | undefined => {
  const flattened = name
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

const resolveConsentedWorkspaceMemberId = (
  link: SlackUserLinkSummary,
): string | undefined =>
  isConsentedSlackUserLink(link.consentState) &&
  isNonEmptyString(link.workspaceMemberId)
    ? link.workspaceMemberId
    : undefined;

const resolveWorkspaceMemberLabels = async ({
  client,
  linkBySlackUserId,
}: {
  client: CoreApiClient;
  linkBySlackUserId: ReadonlyMap<string, SlackUserLinkSummary>;
}): Promise<Map<string, SlackMentionLabel>> => {
  const consentedWorkspaceMemberIds = [
    ...new Set(
      [...linkBySlackUserId.values()]
        .map(resolveConsentedWorkspaceMemberId)
        .filter(isNonEmptyString),
    ),
  ];

  const nameByWorkspaceMemberId = await findWorkspaceMemberNamesByIds(client, {
    workspaceMemberIds: consentedWorkspaceMemberIds,
  });

  const labelBySlackUserId = new Map<string, SlackMentionLabel>();

  for (const link of linkBySlackUserId.values()) {
    const workspaceMemberId = resolveConsentedWorkspaceMemberId(link);

    if (
      !isNonEmptyString(workspaceMemberId) ||
      !nameByWorkspaceMemberId.has(workspaceMemberId)
    ) {
      continue;
    }

    const name =
      [nameByWorkspaceMemberId.get(workspaceMemberId), link.name]
        .filter(isNonEmptyString)
        .map(sanitizeMentionName)
        .find(isNonEmptyString) ?? `Slack user ${link.slackUserId}`;

    labelBySlackUserId.set(link.slackUserId, {
      label: formatWorkspaceMemberLabel({ name, workspaceMemberId }),
      name,
    });
  }

  return labelBySlackUserId;
};

const fetchSlackDisplayNames = async ({
  slackClient,
  slackUserIds,
}: {
  slackClient: WebClient;
  slackUserIds: string[];
}): Promise<Map<string, string>> => {
  const identities = await Promise.all(
    slackUserIds
      .slice(0, MAX_SLACK_USER_LOOKUPS)
      .map((slackUserId) =>
        fetchSlackUserIdentity({ client: slackClient, slackUserId }),
      ),
  );

  const displayNameBySlackUserId = new Map<string, string>();

  for (const identity of identities) {
    if (!isDefined(identity) || !isNonEmptyString(identity.displayName)) {
      continue;
    }

    const displayName = sanitizeMentionName(identity.displayName);

    if (isNonEmptyString(displayName)) {
      displayNameBySlackUserId.set(identity.slackUserId, displayName);
    }
  }

  return displayNameBySlackUserId;
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

  const installedSlackTeamId = await getInstalledSlackTeamId(slackClient);

  if (!isNonEmptyString(installedSlackTeamId)) {
    return labelBySlackUserId;
  }

  const linkBySlackUserId = await findSlackUserLinksBySlackUserIds(client, {
    slackTeamId: installedSlackTeamId,
    slackUserIds: mentionedUserIds,
  });

  const workspaceMemberLabelBySlackUserId = await resolveWorkspaceMemberLabels({
    client,
    linkBySlackUserId,
  });

  const slackLookupUserIds: string[] = [];

  for (const slackUserId of mentionedUserIds) {
    const workspaceMemberLabel =
      workspaceMemberLabelBySlackUserId.get(slackUserId);

    if (isDefined(workspaceMemberLabel)) {
      labelBySlackUserId.set(slackUserId, workspaceMemberLabel);
      continue;
    }

    const linkName = sanitizeMentionName(
      linkBySlackUserId.get(slackUserId)?.name ?? '',
    );

    if (isNonEmptyString(linkName)) {
      labelBySlackUserId.set(slackUserId, {
        label: formatUnconfirmedLabel(linkName),
        name: linkName,
      });
      continue;
    }

    slackLookupUserIds.push(slackUserId);
  }

  const displayNameBySlackUserId = await fetchSlackDisplayNames({
    slackClient,
    slackUserIds: slackLookupUserIds,
  });

  for (const [slackUserId, displayName] of displayNameBySlackUserId) {
    labelBySlackUserId.set(slackUserId, {
      label: formatUnconfirmedLabel(displayName),
      name: displayName,
    });
  }

  return labelBySlackUserId;
};
