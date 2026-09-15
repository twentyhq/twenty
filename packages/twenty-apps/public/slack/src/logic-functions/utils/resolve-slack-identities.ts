import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { findSlackUserLinksBySlackUserIds } from 'src/logic-functions/data/find-slack-user-links-by-slack-user-ids';
import { findWorkspaceMemberIdsByEmails } from 'src/logic-functions/data/find-workspace-member-ids-by-emails';
import { type SlackIdentityResolution } from 'src/logic-functions/types/slack-identity-resolution.type';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { type SlackUserLinkSummary } from 'src/logic-functions/types/slack-user-link-summary.type';
import { fetchSlackUserIdentity } from 'src/logic-functions/utils/fetch-slack-user-identity';
import { getInstalledSlackTeamId } from 'src/logic-functions/utils/get-installed-slack-team-id';
import { isLinkableSlackIdentity } from 'src/logic-functions/utils/is-linkable-slack-identity';
import { isManualConsentedSlackUserLink } from 'src/logic-functions/utils/is-manual-consented-slack-user-link';

const MAX_SLACK_USER_LOOKUPS = 8;

const fetchMissingIdentities = async ({
  slackClient,
  slackUserIds,
  knownIdentityBySlackUserId,
}: {
  slackClient: WebClient;
  slackUserIds: string[];
  knownIdentityBySlackUserId: ReadonlyMap<string, SlackUserIdentity>;
}): Promise<Map<string, SlackUserIdentity>> => {
  const identityBySlackUserId = new Map(knownIdentityBySlackUserId);

  const fetchedIdentities = await Promise.all(
    slackUserIds
      .filter((slackUserId) => !identityBySlackUserId.has(slackUserId))
      .slice(0, MAX_SLACK_USER_LOOKUPS)
      .map((slackUserId) =>
        fetchSlackUserIdentity({ client: slackClient, slackUserId }),
      ),
  );

  for (const identity of fetchedIdentities) {
    if (isDefined(identity)) {
      identityBySlackUserId.set(identity.slackUserId, identity);
    }
  }

  return identityBySlackUserId;
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

const needsEmailRevalidation = ({
  identity,
  link,
  installedSlackTeamId,
}: {
  identity: SlackUserIdentity;
  link: SlackUserLinkSummary | undefined;
  installedSlackTeamId: string | undefined;
}): boolean =>
  !(isDefined(link) && isManualConsentedSlackUserLink(link)) &&
  isLinkableSlackIdentity({ identity, installedSlackTeamId });

const buildResolution = ({
  slackUserId,
  identity,
  link,
  installedSlackTeamId,
  workspaceMemberIdByEmail,
}: {
  slackUserId: string;
  identity: SlackUserIdentity | undefined;
  link: SlackUserLinkSummary | undefined;
  installedSlackTeamId: string | undefined;
  workspaceMemberIdByEmail: ReadonlyMap<string, string>;
}): SlackIdentityResolution => {
  if (!isDefined(identity)) {
    return { slackUserId, identity, link, outcome: 'unidentified' };
  }

  if (isDefined(link) && isManualConsentedSlackUserLink(link)) {
    return isNonEmptyString(link.workspaceMemberId)
      ? {
          slackUserId,
          identity,
          link,
          outcome: 'confirmedMember',
          workspaceMemberId: link.workspaceMemberId,
          memberProvenance: 'manualConsentedLink',
        }
      : { slackUserId, identity, link, outcome: 'membershipNotConfirmed' };
  }

  if (!isLinkableSlackIdentity({ identity, installedSlackTeamId })) {
    return { slackUserId, identity, link, outcome: 'membershipNotConfirmed' };
  }

  const workspaceMemberId = workspaceMemberIdByEmail.get(
    (identity.email ?? '').toLowerCase(),
  );

  return isNonEmptyString(workspaceMemberId)
    ? {
        slackUserId,
        identity,
        link,
        outcome: 'confirmedMember',
        workspaceMemberId,
        memberProvenance: 'verifiedEmail',
      }
    : { slackUserId, identity, link, outcome: 'membershipNotConfirmed' };
};

export const resolveSlackIdentities = async ({
  slackUserIds,
  knownIdentities = [],
  client,
  slackClient,
}: {
  slackUserIds: string[];
  knownIdentities?: SlackUserIdentity[];
  client: CoreApiClient;
  slackClient: WebClient | undefined;
}): Promise<Map<string, SlackIdentityResolution>> => {
  const resolutionBySlackUserId = new Map<string, SlackIdentityResolution>();
  const requestedSlackUserIds = [...new Set(slackUserIds)];

  if (requestedSlackUserIds.length === 0) {
    return resolutionBySlackUserId;
  }

  if (!isDefined(slackClient)) {
    for (const slackUserId of requestedSlackUserIds) {
      resolutionBySlackUserId.set(slackUserId, {
        slackUserId,
        identity: undefined,
        link: undefined,
        outcome: 'unidentified',
      });
    }

    return resolutionBySlackUserId;
  }

  const [installedSlackTeamId, identityBySlackUserId] = await Promise.all([
    getInstalledSlackTeamId(slackClient),
    fetchMissingIdentities({
      slackClient,
      slackUserIds: requestedSlackUserIds,
      knownIdentityBySlackUserId: new Map(
        knownIdentities.map((identity) => [identity.slackUserId, identity]),
      ),
    }),
  ]);

  const linkBySlackUserId = await findSlackUserLinksBySlackUserIds(client, {
    slackUserIdsBySlackTeamId: groupSlackUserIdsByTeamId(identityBySlackUserId),
  });

  const revalidatedEmails = [...identityBySlackUserId.values()]
    .filter((identity) =>
      needsEmailRevalidation({
        identity,
        link: linkBySlackUserId.get(identity.slackUserId),
        installedSlackTeamId,
      }),
    )
    .map((identity) => identity.email)
    .filter(isNonEmptyString);

  const { workspaceMemberIdByEmail } = await findWorkspaceMemberIdsByEmails(
    client,
    { emails: revalidatedEmails },
  );

  for (const slackUserId of requestedSlackUserIds) {
    resolutionBySlackUserId.set(
      slackUserId,
      buildResolution({
        slackUserId,
        identity: identityBySlackUserId.get(slackUserId),
        link: linkBySlackUserId.get(slackUserId),
        installedSlackTeamId,
        workspaceMemberIdByEmail,
      }),
    );
  }

  return resolutionBySlackUserId;
};
