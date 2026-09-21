import {
  SLACK_SUGGESTED_PROMPTS,
  SLACK_SUGGESTED_PROMPTS_TITLE,
} from 'src/logic-functions/constants/slack-suggested-prompts';
import { type SlackEventsRequestBody } from 'src/logic-functions/types/slack-events-request-body.type';
import { getSlackClient } from 'src/logic-functions/utils/get-slack-client';
import { parseSlackHomeOpenedEvent } from 'src/logic-functions/utils/parse-slack-home-opened-event';

type SetSlackSuggestedPromptsResult = { ok: boolean; skipped?: string };

export const setSlackSuggestedPrompts = async (
  body: SlackEventsRequestBody,
): Promise<SetSlackSuggestedPromptsResult> => {
  const parsed = parseSlackHomeOpenedEvent(body);

  if (parsed.homeOpened === null) {
    return { ok: true, skipped: parsed.skipReason };
  }

  const { slackChannelId } = parsed.homeOpened;

  const slackClientResult = await getSlackClient();

  if (!slackClientResult.success) {
    throw new Error(slackClientResult.error);
  }

  try {
    await slackClientResult.client.assistant.threads.setSuggestedPrompts({
      channel_id: slackChannelId,
      title: SLACK_SUGGESTED_PROMPTS_TITLE,
      prompts: SLACK_SUGGESTED_PROMPTS,
    });
  } catch (error) {
    throw new Error(
      `Failed to set the Slack suggested prompts in channel ${slackChannelId}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  return { ok: true };
};
