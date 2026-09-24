import { isDefined } from 'twenty-sdk/utils';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';
import { type SlackUserLinkConsentState } from 'src/logic-functions/types/slack-user-link-consent-state.type';

// A link written before consent existed carries no state, and stays trusted so
// upgrading does not silently revoke links an admin already set.
export const isConsentedSlackUserLink = (
  consentState: SlackUserLinkConsentState | undefined,
): boolean =>
  !isDefined(consentState) ||
  consentState === SLACK_USER_LINK_CONSENT_STATE.ACTIVE ||
  consentState === SLACK_USER_LINK_CONSENT_STATE.ADMIN_SET;
