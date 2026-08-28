import { useRef, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { SLACK_USER_LINKS_RESEND_CONSENT_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { parseSlackToolResult } from 'src/front-components/utils/parse-slack-tool-result.util';

const FALLBACK_MESSAGE = 'Could not resend the consent request';

type ResendConsentInput = {
  id: string;
  slackTeamId: string;
  slackUserId: string;
};

type ResendSlackUserLinkConsentState = {
  resendConsent: (input: ResendConsentInput) => Promise<SlackToolResult>;
  resendingLinkId: string | undefined;
};

export const useResendSlackUserLinkConsent =
  (): ResendSlackUserLinkConsentState => {
    const [resendingLinkId, setResendingLinkId] = useState<string | undefined>(
      undefined,
    );
    // Ref, not state: a same-tick second click sees pre-rerender state, so a
    // state guard would let it start a second request and clear the first
    // one's marker mid-flight.
    const isResendingRef = useRef(false);

    const resendConsent = async ({
      id,
      slackTeamId,
      slackUserId,
    }: ResendConsentInput): Promise<SlackToolResult> => {
      if (isResendingRef.current) {
        return {
          success: false,
          message: FALLBACK_MESSAGE,
          error: 'Another consent request is still being sent. Please wait.',
        };
      }

      isResendingRef.current = true;
      setResendingLinkId(id);

      try {
        const result = await new RestApiClient().post(
          `/s${SLACK_USER_LINKS_RESEND_CONSENT_ROUTE_PATH}`,
          { slackTeamId, slackUserId },
        );

        return parseSlackToolResult(result, FALLBACK_MESSAGE);
      } catch {
        return {
          success: false,
          message: FALLBACK_MESSAGE,
          error: 'The request failed. Please try again.',
        };
      } finally {
        isResendingRef.current = false;
        setResendingLinkId(undefined);
      }
    };

    return { resendConsent, resendingLinkId };
  };
