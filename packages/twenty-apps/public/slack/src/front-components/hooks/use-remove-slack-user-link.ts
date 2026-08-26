import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { SLACK_USER_LINKS_REMOVE_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { parseSlackToolResult } from 'src/front-components/utils/parse-slack-tool-result.util';

const FALLBACK_MESSAGE = 'Could not remove the link';

type RemoveSlackUserLinkState = {
  removeSlackUserLink: (id: string) => Promise<SlackToolResult>;
  removingLinkId: string | undefined;
};

export const useRemoveSlackUserLink = (): RemoveSlackUserLinkState => {
  const [removingLinkId, setRemovingLinkId] = useState<string | undefined>(
    undefined,
  );

  const removeSlackUserLink = async (id: string): Promise<SlackToolResult> => {
    setRemovingLinkId(id);

    try {
      const result = await new RestApiClient().post(
        `/s${SLACK_USER_LINKS_REMOVE_ROUTE_PATH}`,
        { id },
      );

      return parseSlackToolResult(result, FALLBACK_MESSAGE);
    } catch {
      return {
        success: false,
        message: FALLBACK_MESSAGE,
        error: 'The request failed. Please try again.',
      };
    } finally {
      setRemovingLinkId(undefined);
    }
  };

  return { removeSlackUserLink, removingLinkId };
};
