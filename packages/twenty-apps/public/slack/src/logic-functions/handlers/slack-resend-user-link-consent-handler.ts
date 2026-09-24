import { isNonEmptyString } from '@sniptt/guards';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { findSlackUserLink } from 'src/logic-functions/data/find-slack-user-link';
import { findWorkspaceMemberNameById } from 'src/logic-functions/data/find-workspace-member-name-by-id';
import { type SlackRouteBody } from 'src/logic-functions/types/slack-route-body.type';
import { type SlackUserLink } from 'src/logic-functions/types/slack-user-link.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { currentUserHasRolesPermission } from 'src/logic-functions/utils/current-user-has-roles-permission';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { readOptionalString } from 'src/logic-functions/utils/read-optional-string.util';
import { sendSlackUserLinkConsentDm } from 'src/logic-functions/utils/send-slack-user-link-consent-dm';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const readBody = (
  payload: SlackRouteBody,
): { slackTeamId?: string; slackUserId?: string } => {
  const body = asRecord(payload.body) ?? {};

  return {
    slackTeamId: readOptionalString(body.slackTeamId),
    slackUserId: readOptionalString(body.slackUserId),
  };
};

export const slackResendUserLinkConsentHandler = async (
  payload: SlackRouteBody,
): Promise<SlackToolResult> => {
  const { slackTeamId, slackUserId } = readBody(payload);

  if (!isNonEmptyString(slackTeamId) || !isNonEmptyString(slackUserId)) {
    return {
      success: false,
      message: 'Missing required fields',
      error: 'slackTeamId and slackUserId are required.',
    };
  }

  const isAllowed = await currentUserHasRolesPermission();

  if (!isAllowed) {
    return {
      success: false,
      message: 'Not allowed',
      error:
        'Only members with the roles permission can resend consent requests.',
    };
  }

  const client = new CoreApiClient({ runAs: 'application' });

  let link: SlackUserLink | undefined;

  try {
    link = await findSlackUserLink(client, { slackTeamId, slackUserId });
  } catch (error) {
    return {
      success: false,
      message: 'Could not look up the link',
      error: toErrorMessage(error),
    };
  }

  if (!isDefined(link)) {
    return {
      success: false,
      message: 'No link to resend',
      error: 'No Slack user link found for that account.',
    };
  }

  if (link.consentState !== SLACK_USER_LINK_CONSENT_STATE.PENDING) {
    return {
      success: false,
      message: 'Nothing to resend',
      error: 'This link is not awaiting consent.',
    };
  }

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    return {
      success: false,
      message: 'Slack is not connected',
      error: slackClientResult.error,
    };
  }

  if (!isNonEmptyString(link.workspaceMemberId)) {
    return {
      success: false,
      message: 'Nothing to resend',
      error: 'This link is not assigned to a workspace member.',
    };
  }

  const memberName = await findWorkspaceMemberNameById(
    client,
    link.workspaceMemberId,
  );

  const dmResult = await sendSlackUserLinkConsentDm(slackClientResult.client, {
    slackTeamId,
    slackUserId,
    workspaceMemberId: link.workspaceMemberId,
    slackUserLinkId: link.id,
    memberName,
  });

  if (!dmResult.success) {
    return {
      success: false,
      message: 'Could not deliver the consent request',
      error: dmResult.error,
    };
  }

  return {
    success: true,
    message: `Resent the consent request to Slack user ${slackUserId}.`,
  };
};
