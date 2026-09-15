import { SLACK_USER_LINKS_REMOVE_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { useSlackToolPost } from 'src/front-components/hooks/use-slack-tool-post';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';

type RemoveSlackUserLinkState = {
  removeSlackUserLink: (id: string) => Promise<SlackToolResult>;
  removingLinkId: string | undefined;
};

export const useRemoveSlackUserLink = (): RemoveSlackUserLinkState => {
  const { postSlackTool, inFlightLinkId } = useSlackToolPost({
    routePath: SLACK_USER_LINKS_REMOVE_ROUTE_PATH,
    fallbackMessage: 'Could not remove the link',
    busyError: 'Another removal is still in progress. Please wait.',
  });

  return {
    removeSlackUserLink: (id) => postSlackTool({ linkId: id, payload: { id } }),
    removingLinkId: inFlightLinkId,
  };
};
