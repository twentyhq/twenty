import { type WebClient } from '@slack/web-api';
import { isNonEmptyString } from '@sniptt/guards';
import { type CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_ACCESS_MODE } from 'src/logic-functions/constants/slack-access-mode';
import { type SlackAccessDecision } from 'src/logic-functions/types/slack-access-decision.type';
import { type SlackAccessMode } from 'src/logic-functions/types/slack-access-mode.type';
import { type SlackUserIdentity } from 'src/logic-functions/types/slack-user-identity.type';
import { resolveSlackIdentities } from 'src/logic-functions/utils/resolve-slack-identities';

export const resolveSlackAccessDecision = async ({
  accessMode,
  client,
  slackClient,
  identity,
  runAsWorkspaceMemberId,
}: {
  accessMode: SlackAccessMode;
  client: CoreApiClient;
  slackClient: WebClient | undefined;
  identity: SlackUserIdentity | undefined;
  runAsWorkspaceMemberId: string | undefined;
}): Promise<SlackAccessDecision> => {
  if (accessMode === SLACK_ACCESS_MODE.ANYONE) {
    return { status: 'ALLOWED' };
  }

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
  }).catch(() => undefined);

  const resolution = resolutionBySlackUserId?.get(slackUserId);

  if (!isDefined(resolution)) {
    return { status: 'UNVERIFIABLE' };
  }

  switch (resolution.outcome) {
    case 'confirmedMember':
      return { status: 'ALLOWED' };
    case 'membershipNotConfirmed':
      return { status: 'DENIED' };
    case 'membershipUnverifiable':
    case 'unidentified':
      return { status: 'UNVERIFIABLE' };
  }
};
