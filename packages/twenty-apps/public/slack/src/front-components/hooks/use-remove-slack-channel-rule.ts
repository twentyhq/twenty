import { SLACK_CHANNEL_RULES_REMOVE_ROUTE_PATH } from 'src/constants/slack-channel-rules-route-path.constant';
import { useSlackToolPost } from 'src/front-components/hooks/use-slack-tool-post';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';

type RemoveSlackChannelRuleState = {
  removeSlackChannelRule: (id: string) => Promise<SlackToolResult>;
  removingRuleId: string | undefined;
};

export const useRemoveSlackChannelRule = (): RemoveSlackChannelRuleState => {
  const { postSlackTool, inFlightLinkId } = useSlackToolPost({
    routePath: SLACK_CHANNEL_RULES_REMOVE_ROUTE_PATH,
    fallbackMessage: 'Could not remove the channel rule',
    busyError: 'Another removal is still in progress. Please wait.',
  });

  return {
    removeSlackChannelRule: (id) =>
      postSlackTool({ linkId: id, payload: { id } }),
    removingRuleId: inFlightLinkId,
  };
};
