import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ASSISTANT_MENTION_LABEL } from 'src/logic-functions/constants/slack-assistant-mention-label';
import { findWorkspaceMemberNamesByIds } from 'src/logic-functions/data/find-workspace-member-names-by-ids';
import { type SlackIdentityResolution } from 'src/logic-functions/types/slack-identity-resolution.type';
import { type SlackMentionLabel } from 'src/logic-functions/types/slack-mention-label.type';
import { resolveSlackIdentities } from 'src/logic-functions/utils/resolve-slack-identities';

const MAX_MENTIONED_USERS = 20;
const MAX_MENTION_NAME_LENGTH = 80;
const LABEL_SUFFIX_FORGING_CHARACTERS_PATTERN = /[()]/g;

// Slack profile names are attacker-controlled, and a newline lets one pose as
// its own prompt section.
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

const resolveSlackName = (
  resolution: SlackIdentityResolution,
): string | undefined =>
  [resolution.identity?.displayName, resolution.link?.name]
    .map(sanitizeMentionName)
    .find(isNonEmptyString);

const buildLabel = ({
  resolution,
  nameByWorkspaceMemberId,
}: {
  resolution: SlackIdentityResolution;
  nameByWorkspaceMemberId: ReadonlyMap<string, string | undefined>;
}): SlackMentionLabel => {
  const slackName = resolveSlackName(resolution);

  // A member id whose record is gone is worse to hand over than no id.
  if (
    resolution.outcome === 'confirmedMember' &&
    nameByWorkspaceMemberId.has(resolution.workspaceMemberId)
  ) {
    const name =
      sanitizeMentionName(
        nameByWorkspaceMemberId.get(resolution.workspaceMemberId),
      ) ??
      slackName ??
      `Slack user ${resolution.slackUserId}`;

    return {
      label: formatWorkspaceMemberLabel({
        name,
        workspaceMemberId: resolution.workspaceMemberId,
      }),
      name,
    };
  }

  return isNonEmptyString(slackName)
    ? { label: formatUnconfirmedLabel(slackName), name: slackName }
    : {
        label: formatUnknownLabel(resolution.slackUserId),
        name: undefined,
      };
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

  if (mentionedUserIds.length === 0) {
    return labelBySlackUserId;
  }

  const resolutionBySlackUserId = await resolveSlackIdentities({
    slackUserIds: mentionedUserIds,
    client,
    slackClient,
  });

  const confirmedWorkspaceMemberIds = [
    ...new Set(
      [...resolutionBySlackUserId.values()]
        .map((resolution) =>
          resolution.outcome === 'confirmedMember'
            ? resolution.workspaceMemberId
            : undefined,
        )
        .filter(isNonEmptyString),
    ),
  ];

  const nameByWorkspaceMemberId = await findWorkspaceMemberNamesByIds(client, {
    workspaceMemberIds: confirmedWorkspaceMemberIds,
  });

  for (const slackUserId of mentionedUserIds) {
    const resolution = resolutionBySlackUserId.get(slackUserId);

    if (isDefined(resolution)) {
      labelBySlackUserId.set(
        slackUserId,
        buildLabel({ resolution, nameByWorkspaceMemberId }),
      );
    }
  }

  return labelBySlackUserId;
};
