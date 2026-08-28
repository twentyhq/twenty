import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { SLACK_USER_LINKS_SET_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { parseSlackToolResult } from 'src/front-components/utils/parse-slack-tool-result.util';
import { type SlackSetUserLinkInput } from 'src/logic-functions/types/slack-set-user-link-input.type';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';

const FALLBACK_MESSAGE = 'Could not save the link';

const GENERIC_ERROR_RESULT: SlackToolResult = {
  success: false,
  message: FALLBACK_MESSAGE,
  error: 'The request failed. Please try again.',
};

type SetSlackUserLinkState = {
  setSlackUserLink: (input: SlackSetUserLinkInput) => Promise<SlackToolResult>;
  isSubmitting: boolean;
};

export const useSetSlackUserLink = (): SetSlackUserLinkState => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setSlackUserLink = async (
    input: SlackSetUserLinkInput,
  ): Promise<SlackToolResult> => {
    setIsSubmitting(true);

    try {
      const result = await new RestApiClient().post(
        `/s${SLACK_USER_LINKS_SET_ROUTE_PATH}`,
        input,
      );

      return parseSlackToolResult({
        value: result,
        fallbackMessage: FALLBACK_MESSAGE,
      });
    } catch {
      return GENERIC_ERROR_RESULT;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { setSlackUserLink, isSubmitting };
};
