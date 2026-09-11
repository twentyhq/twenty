import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_MEMBER_PROVENANCE } from 'src/logic-functions/constants/slack-member-provenance';
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

// A link is keyed by the workspace its user belongs to, which for a guest or
// Slack Connect member is not the workspace the app is installed in.
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

  // A hand-picked consented link settles the question on its own, including
  // when it deliberately names nobody, so it never falls back to an email.
  if (isDefined(link) && isManualConsentedSlackUserLink(link)) {
    return isNonEmptyString(link.workspaceMemberId)
      ? {
          slackUserId,
          identity,
          link,
          outcome: 'confirmedMember',
          workspaceMemberId: link.workspaceMemberId,
          memberProvenance: SLACK_MEMBER_PROVENANCE.MANUAL_CONSENTED_LINK,
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
        memberProvenance: SLACK_MEMBER_PROVENANCE.VERIFIED_EMAIL,
      }
    : { slackUserId, identity, link, outcome: 'membershipNotConfirmed' };
};

// The one place that decides which workspace member a Slack account speaks for.
// Run-as and mention rendering both read it, so neither can drift into trusting
// a stored member id the other would have re-earned from the live account.
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

  if (slackUserIds.length === 0) {
    return resolutionBySlackUserId;
  }

  if (!isDefined(slackClient)) {
    for (const slackUserId of slackUserIds) {
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
      slackUserIds,
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

  for (const slackUserId of slackUserIds) {
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
