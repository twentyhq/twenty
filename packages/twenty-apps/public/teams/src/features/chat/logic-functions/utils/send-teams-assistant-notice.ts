import { isNonEmptyString } from '@sniptt/guards';

import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';
import { type TeamsAssistantNoticeKind } from 'src/features/chat/logic-functions/types/teams-assistant-notice-kind.type';
import { isTeamsActivityAddressedToBot } from 'src/features/chat/logic-functions/utils/is-teams-activity-addressed-to-bot';
import { sendTeamsReplyOnce } from 'src/features/chat/logic-functions/utils/send-teams-reply-once';

// A notice is a courtesy: failing to post it must not fail or retry the activity.
export const sendTeamsAssistantNotice = async ({
  payload,
  kind,
  text,
  ttlMs,
}: {
  payload: TeamsActivitiesDispatchPayload;
  kind: TeamsAssistantNoticeKind;
  text: string;
  ttlMs: number;
}): Promise<boolean> => {
  const conversationId = payload.activity.conversation?.id;

  if (
    !isNonEmptyString(conversationId) ||
    !isTeamsActivityAddressedToBot(payload)
  ) {
    return false;
  }

  return sendTeamsReplyOnce({
    kvKey: `teams-notice:${kind}:${conversationId}`,
    ttlMs,
    serviceUrl: payload.serviceUrl,
    conversationId,
    text,
  }).catch((error: unknown) => {
    console.warn(
      `[teams] could not post the ${kind} notice in ${conversationId}`,
      error,
    );

    return false;
  });
};
