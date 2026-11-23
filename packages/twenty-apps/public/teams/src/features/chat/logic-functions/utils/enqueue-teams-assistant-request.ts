import { isDefined } from 'twenty-sdk/utils';

import { RELEASE_FLAGS } from 'src/constants/release-flags';
import { TEAMS_ASSISTANT_CHAT_OFF_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-chat-off-text';
import { TEAMS_ASSISTANT_HELP_TEXT } from 'src/features/chat/logic-functions/constants/teams-assistant-help-text';
import { TEAMS_ASSISTANT_NOTICE_TTL_MS } from 'src/features/chat/logic-functions/constants/teams-assistant-notice-ttl-ms';
import { TEAMS_ASSISTANT_WELCOME_TTL_MS } from 'src/features/chat/logic-functions/constants/teams-assistant-welcome-ttl-ms';
import { type TeamsActivitiesDispatchPayload } from 'src/features/chat/logic-functions/types/teams-activities-dispatch-payload.type';
import { type TeamsActivitiesEnqueueResult } from 'src/features/chat/logic-functions/types/teams-activities-enqueue-result.type';
import { enqueueTeamsAssistantRequestRecord } from 'src/features/chat/logic-functions/utils/enqueue-teams-assistant-request-record';
import { isTeamsChatEnabled } from 'src/features/chat/logic-functions/utils/is-teams-chat-enabled';
import { isTeamsHelpRequest } from 'src/features/chat/logic-functions/utils/is-teams-help-request';
import { isTeamsInstallActivity } from 'src/features/chat/logic-functions/utils/is-teams-install-activity';
import { parseTeamsAssistantRequest } from 'src/features/chat/logic-functions/utils/parse-teams-assistant-request';
import { replyWithTeamsAssistantHelp } from 'src/features/chat/logic-functions/utils/reply-with-teams-assistant-help';
import { sendTeamsAssistantNotice } from 'src/features/chat/logic-functions/utils/send-teams-assistant-notice';

const CHAT_DISABLED_SKIP_REASON = 'Chat is disabled';

export const enqueueTeamsAssistantRequest = async (
  payload: TeamsActivitiesDispatchPayload,
): Promise<TeamsActivitiesEnqueueResult> => {
  if (!RELEASE_FLAGS.IS_CHAT_ASSISTANT_RELEASED) {
    return { ok: true, skipped: CHAT_DISABLED_SKIP_REASON };
  }

  if (!isTeamsChatEnabled()) {
    await sendTeamsAssistantNotice({
      payload,
      kind: 'chat-off',
      text: TEAMS_ASSISTANT_CHAT_OFF_TEXT,
      ttlMs: TEAMS_ASSISTANT_NOTICE_TTL_MS,
    });

    return { ok: true, skipped: CHAT_DISABLED_SKIP_REASON };
  }

  if (isTeamsInstallActivity(payload.activity)) {
    const isWelcomeSent = await sendTeamsAssistantNotice({
      payload,
      kind: 'welcome',
      text: TEAMS_ASSISTANT_HELP_TEXT,
      ttlMs: TEAMS_ASSISTANT_WELCOME_TTL_MS,
    });

    return isWelcomeSent
      ? { ok: true }
      : { ok: true, skipped: 'Welcome was not sent' };
  }

  const parsed = parseTeamsAssistantRequest(payload);

  if (parsed.request === null) {
    return isDefined(parsed.emptyRequest)
      ? await replyWithTeamsAssistantHelp(parsed.emptyRequest)
      : { ok: true, skipped: parsed.skipReason };
  }

  if (isTeamsHelpRequest(parsed.request.requestText)) {
    return await replyWithTeamsAssistantHelp(parsed.request);
  }

  return await enqueueTeamsAssistantRequestRecord(parsed.request);
};
