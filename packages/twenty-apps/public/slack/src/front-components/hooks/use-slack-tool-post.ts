import { useRef, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { parseSlackToolResult } from 'src/front-components/utils/parse-slack-tool-result.util';

type SlackToolPostState = {
  postSlackTool: (
    linkId: string,
    payload: Record<string, unknown>,
  ) => Promise<SlackToolResult>;
  inFlightLinkId: string | undefined;
};

export const useSlackToolPost = ({
  routePath,
  fallbackMessage,
  busyError,
}: {
  routePath: string;
  fallbackMessage: string;
  busyError: string;
}): SlackToolPostState => {
  const [inFlightLinkId, setInFlightLinkId] = useState<string | undefined>(
    undefined,
  );
  // Ref, not state: a same-tick second click sees pre-rerender state, so a
  // state guard would let it start a second request and clear the first
  // one's marker mid-flight.
  const isPostingRef = useRef(false);

  const postSlackTool = async (
    linkId: string,
    payload: Record<string, unknown>,
  ): Promise<SlackToolResult> => {
    if (isPostingRef.current) {
      return {
        success: false,
        message: fallbackMessage,
        error: busyError,
      };
    }

    isPostingRef.current = true;
    setInFlightLinkId(linkId);

    try {
      const result = await new RestApiClient().post(`/s${routePath}`, payload);

      return parseSlackToolResult({ value: result, fallbackMessage });
    } catch {
      return {
        success: false,
        message: fallbackMessage,
        error: 'The request failed. Please try again.',
      };
    } finally {
      isPostingRef.current = false;
      setInFlightLinkId(undefined);
    }
  };

  return { postSlackTool, inFlightLinkId };
};
