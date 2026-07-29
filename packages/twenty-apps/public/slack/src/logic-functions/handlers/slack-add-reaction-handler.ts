import { type SlackAddReactionInput } from 'src/logic-functions/types/slack-add-reaction-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { runSlackReaction } from 'src/logic-functions/utils/run-slack-reaction';

export const slackAddReactionHandler = (
  parameters: SlackAddReactionInput,
): Promise<SlackToolResult> =>
  runSlackReaction({
    operation: 'add',
    ...parameters,
  });
