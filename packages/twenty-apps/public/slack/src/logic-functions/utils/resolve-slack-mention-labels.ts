import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import {
  findSlackUserLinksBySlackUserIds,
  type SlackUserLinkSummary,
} from 'src/logic-functions/data/find-slack-user-links-by-slack-user-ids';
import { findWorkspaceMemberNamesByIds } from 'src/logic-functions/data/find-workspace-member-names-by-ids';
import { fetchSlackUserIdentity } from 'src/logic-functions/utils/fetch-slack-user-identity';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';

const MAX_MENTIONED_USERS = 20;
const MAX_SLACK_USER_LOOKUPS = 8;

const ASSISTANT_MENTION_LABEL = 'you';

const formatWorkspaceMemberLabel = ({
  name,
  workspaceMemberId,
}: {
  name: string;
  workspaceMemberId: string;
}): string => `@${name} (workspace member ${workspaceMemberId})`;

const formatSlackOnlyLabel = (name: string): string =>
  `@${name} (no Twenty workspace member)`;

const formatUnknownLabel = (slackUserId: string): string =>
  `@unknown Slack user ${slackUserId}`;

const resolveWorkspaceMemberLabels = async ({
  client,
  linkBySlackUserId,
}: {
  client: CoreApiClient;
  linkBySlackUserId: ReadonlyMap<string, SlackUserLinkSummary>;
}): Promise<Map<string, string>> => {
  const linkedWorkspaceMemberIds = [
    ...new Set(
      [...linkBySlackUserId.values()]
        .map((link) => link.workspaceMemberId)
        .filter(isNonEmptyString),
    ),
  ];

  const nameByWorkspaceMemberId = await findWorkspaceMemberNamesByIds(client, {
    workspaceMemberIds: linkedWorkspaceMemberIds,
  }).catch(() => new Map<string, string | undefined>());

  const labelBySlackUserId = new Map<string, string>();

  for (const link of linkBySlackUserId.values()) {
    const { workspaceMemberId } = link;

    // A link can outlive the member it points at, and a member id the agent
    // cannot act on is worse to hand it than no id at all.
    if (
      !isNonEmptyString(workspaceMemberId) ||
      !nameByWorkspaceMemberId.has(workspaceMemberId)
    ) {
      continue;
    }

    const name =
      nameByWorkspaceMemberId.get(workspaceMemberId) ??
      link.name ??
      `Slack user ${link.slackUserId}`;

    labelBySlackUserId.set(
      link.slackUserId,
      formatWorkspaceMemberLabel({ name, workspaceMemberId }),
    );
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
        fetchSlackUserIdentity({ client: slackClient, slackUserId }).catch(
          () => undefined,
        ),
      ),
  );

  const displayNameBySlackUserId = new Map<string, string>();

  for (const identity of identities) {
    if (isDefined(identity) && isNonEmptyString(identity.displayName)) {
      displayNameBySlackUserId.set(identity.slackUserId, identity.displayName);
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
}): Promise<Map<string, string>> => {
  const labelBySlackUserId = new Map<string, string>();
  const mentionedUserIds: string[] = [];

  for (const slackUserId of slackUserIds) {
    if (slackUserId === assistantBotUserId) {
      labelBySlackUserId.set(slackUserId, ASSISTANT_MENTION_LABEL);
      continue;
    }

    if (mentionedUserIds.length < MAX_MENTIONED_USERS) {
      mentionedUserIds.push(slackUserId);
    }

    labelBySlackUserId.set(slackUserId, formatUnknownLabel(slackUserId));
  }

  if (mentionedUserIds.length === 0 || !isDefined(slackClient)) {
    return labelBySlackUserId;
  }

  const installedSlackTeamId = await getInstalledSlackTeamId(slackClient);

  const linkBySlackUserId = isNonEmptyString(installedSlackTeamId)
    ? await findSlackUserLinksBySlackUserIds(client, {
        slackTeamId: installedSlackTeamId,
        slackUserIds: mentionedUserIds,
      }).catch(() => new Map<string, SlackUserLinkSummary>())
    : new Map<string, SlackUserLinkSummary>();

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

    const linkName = linkBySlackUserId.get(slackUserId)?.name;

    if (isNonEmptyString(linkName)) {
      labelBySlackUserId.set(slackUserId, formatSlackOnlyLabel(linkName));
      continue;
    }

    slackLookupUserIds.push(slackUserId);
  }

  const displayNameBySlackUserId = await fetchSlackDisplayNames({
    slackClient,
    slackUserIds: slackLookupUserIds,
  });

  for (const [slackUserId, displayName] of displayNameBySlackUserId) {
    labelBySlackUserId.set(slackUserId, formatSlackOnlyLabel(displayName));
  }

  return labelBySlackUserId;
};
