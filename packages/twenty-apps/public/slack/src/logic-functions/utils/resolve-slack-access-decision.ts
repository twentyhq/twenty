import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { type SlackAccessDecision } from 'src/logic-functions/types/slack-access-decision.type';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { resolveSlackIdentities } from 'src/logic-functions/utils/resolve-slack-identities';

export const resolveSlackAccessDecision = async ({
  client,
  slackClient,
  slackConnectionId,
  identity,
  runAsWorkspaceMemberId,
}: {
  client: CoreApiClient;
  slackClient: WebClient | undefined;
  slackConnectionId: string | undefined;
  identity: SlackUserIdentity | undefined;
  runAsWorkspaceMemberId: string | undefined;
}): Promise<SlackAccessDecision> => {
  if (isNonEmptyString(runAsWorkspaceMemberId)) {
    return { status: 'ALLOWED' };
  }

  if (!isDefined(slackClient) || !isDefined(identity)) {
    return { status: 'UNVERIFIABLE' };
  }

  const { slackUserId } = identity;

  const resolutionBySlackUserId = await resolveSlackIdentities({
    slackUserIds: [slackUserId],
    knownIdentities: [identity],
    client,
    slackClient,
    slackConnectionId,
  }).catch(() => undefined);

  const resolution = resolutionBySlackUserId?.get(slackUserId);

  if (!isDefined(resolution)) {
    return { status: 'UNVERIFIABLE' };
  }

  switch (resolution.outcome) {
    case 'membershipUnverifiable':
    case 'unidentified':
      return { status: 'UNVERIFIABLE' };
    case 'confirmedMember':
    case 'membershipNotConfirmed':
      return { status: 'DENIED' };
  }
};
