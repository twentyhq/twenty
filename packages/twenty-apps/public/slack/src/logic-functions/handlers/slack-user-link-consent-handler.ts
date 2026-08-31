import { CoreApiClient } from 'twenty-client-sdk/core';
import { isDefined } from 'twenty-sdk/utils';

import { SLACK_USER_LINK_CONSENT_ACTION_ID } from 'src/logic-functions/constants/slack-user-link-consent-action-id';
import { SLACK_USER_LINK_CONSENT_DECISION } from 'src/logic-functions/constants/slack-user-link-consent-decision';
import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { findSlackUserLink } from 'src/logic-functions/data/find-slack-user-link';
import { updateSlackUserLink } from 'src/logic-functions/data/update-slack-user-link';
import { type SlackInteractivityPayload } from 'src/logic-functions/types/slack-interactivity-payload.type';
import { type SlackUserLink } from 'src/logic-functions/types/slack-user-link.type';
import { type SlackUserLinkConsentResult } from 'src/logic-functions/types/slack-user-link-consent-result.type';
import { parseSlackUserLinkConsentButtonValue } from 'src/logic-functions/utils/parse-slack-user-link-consent-button-value';
import { updateSlackMessageViaResponseUrl } from 'src/logic-functions/utils/update-slack-message-via-response-url';
import { toErrorMessage } from 'src/logic-functions/utils/to-error-message.util';

const APPROVED_MESSAGE =
  'Thanks, you approved the link. The Twenty assistant can now act with that member access when you message it.';

const DECLINED_MESSAGE =
  'No problem, you declined the link. The Twenty assistant will keep answering with its own access.';

const FAILURE_MESSAGE =
  'Something went wrong saving your choice. Please try the button again in a moment.';

export const slackUserLinkConsentHandler = async (
  payload: SlackInteractivityPayload,
): Promise<SlackUserLinkConsentResult> => {
  const consentAction = payload.actions?.find((action) =>
    action.action_id?.startsWith(SLACK_USER_LINK_CONSENT_ACTION_ID),
  );

  if (!isDefined(consentAction)) {
    return { skipped: true, reason: 'No consent action in payload' };
  }

  const buttonValue = parseSlackUserLinkConsentButtonValue(consentAction.value);

  if (!isDefined(buttonValue)) {
    return { skipped: true, reason: 'Consent action has no valid value' };
  }

  if (
    payload.user?.id !== buttonValue.slackUserId ||
    payload.team?.id !== buttonValue.slackTeamId
  ) {
    return {
      skipped: true,
      reason: 'Consent decision came from a different Slack user',
    };
  }

  const client = new CoreApiClient({ runAs: 'application' });

  let link: SlackUserLink | undefined;

  try {
    link = await findSlackUserLink(client, {
      slackTeamId: buttonValue.slackTeamId,
      slackUserId: buttonValue.slackUserId,
    });
  } catch {
    return { skipped: true, reason: 'Could not read the link' };
  }

  if (!isDefined(link)) {
    return { skipped: true, reason: 'No link for this Slack user' };
  }

  if (link.consentState !== SLACK_USER_LINK_CONSENT_STATE.PENDING) {
    return {
      skipped: true,
      reason: `Link is not awaiting consent (state: ${link.consentState})`,
    };
  }

  if (
    link.id !== buttonValue.slackUserLinkId ||
    link.workspaceMemberId !== buttonValue.workspaceMemberId
  ) {
    return {
      skipped: true,
      reason: 'Consent decision targets a superseded link',
    };
  }

  const approved =
    buttonValue.decision === SLACK_USER_LINK_CONSENT_DECISION.APPROVE;

  try {
    await updateSlackUserLink(client, {
      id: link.id,
      consentState: approved
        ? SLACK_USER_LINK_CONSENT_STATE.ACTIVE
        : SLACK_USER_LINK_CONSENT_STATE.DECLINED,
    });
  } catch (error) {
    await updateSlackMessageViaResponseUrl({
      responseUrl: payload.response_url,
      text: FAILURE_MESSAGE,
    });

    return {
      skipped: true,
      reason: toErrorMessage(error),
    };
  }

  await updateSlackMessageViaResponseUrl({
    responseUrl: payload.response_url,
    text: approved ? APPROVED_MESSAGE : DECLINED_MESSAGE,
  });

  return { done: true };
};
