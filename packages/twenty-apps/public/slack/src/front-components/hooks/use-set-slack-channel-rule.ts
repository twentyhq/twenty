import { SLACK_CHANNEL_RULES_SET_ROUTE_PATH } from 'src/constants/slack-channel-rules-route-path.constant';
import { useSlackToolPost } from 'src/front-components/hooks/use-slack-tool-post';
import { type SlackSetChannelRuleInput } from 'src/logic-functions/types/slack-set-channel-rule-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';

type SetSlackChannelRuleState = {
  setSlackChannelRule: (
    input: SlackSetChannelRuleInput,
  ) => Promise<SlackToolResult>;
  savingChannelId: string | undefined;
};

export const useSetSlackChannelRule = (): SetSlackChannelRuleState => {
  const { postSlackTool, inFlightLinkId } = useSlackToolPost({
    routePath: SLACK_CHANNEL_RULES_SET_ROUTE_PATH,
    fallbackMessage: 'Could not save the channel rule',
    busyError: 'Another save is still in progress. Please wait.',
  });

  return {
    setSlackChannelRule: (input) =>
      postSlackTool({ linkId: input.slackChannelId, payload: input }),
    savingChannelId: inFlightLinkId,
  };
};
