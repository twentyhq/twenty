import { type SlackUserLinkConsentState } from 'src/logic-functions/types/slack-user-link-consent-state.type';
import { type SlackUserLinkSource } from 'src/logic-functions/types/slack-user-link-source.type';

export type SlackUserLink = {
  id: string;
  workspaceMemberId: string | undefined;
  source: SlackUserLinkSource | undefined;
  consentState: SlackUserLinkConsentState | undefined;
};
