import { useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';

import { SLACK_USER_LINKS_RESEND_CONSENT_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';
import { parseSlackToolResult } from 'src/front-components/utils/parse-slack-tool-result.util';

const FALLBACK_MESSAGE = 'Could not resend the consent request';

type ResendConsentInput = {
  slackTeamId: string;
  slackUserId: string;
};

type ResendSlackUserLinkConsentState = {
  resendConsent: (input: ResendConsentInput) => Promise<SlackToolResult>;
  resendingLinkId: string | undefined;
  setResendingLinkId: (id: string | undefined) => void;
};

export const useResendSlackUserLinkConsent =
  (): ResendSlackUserLinkConsentState => {
    const [resendingLinkId, setResendingLinkId] = useState<string | undefined>(
      undefined,
    );

    const resendConsent = async (
      input: ResendConsentInput,
    ): Promise<SlackToolResult> => {
      try {
        const result = await new RestApiClient().post(
          `/s${SLACK_USER_LINKS_RESEND_CONSENT_ROUTE_PATH}`,
          input,
        );

        return parseSlackToolResult(result, FALLBACK_MESSAGE);
      } catch {
        return {
          success: false,
          message: FALLBACK_MESSAGE,
          error: 'The request failed. Please try again.',
        };
      }
    };

    return { resendConsent, resendingLinkId, setResendingLinkId };
  };
