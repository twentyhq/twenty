import { SLACK_USER_LINKS_RESEND_CONSENT_ROUTE_PATH } from 'src/constants/slack-user-links-route-path.constant';
import { useSlackToolPost } from 'src/front-components/hooks/use-slack-tool-post';
import { type SlackToolResult } from 'src/logic-functions/types/slack-tool-result.type';

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
    const { postSlackTool, inFlightLinkId } = useSlackToolPost({
      routePath: SLACK_USER_LINKS_RESEND_CONSENT_ROUTE_PATH,
      fallbackMessage: 'Could not resend the consent request',
      busyError: 'Another consent request is still being sent. Please wait.',
    });

    return {
      resendConsent: ({ id, slackTeamId, slackUserId }) =>
        postSlackTool({ linkId: id, payload: { slackTeamId, slackUserId } }),
      resendingLinkId: inFlightLinkId,
    };
  };
