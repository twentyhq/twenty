import { isDefined } from 'twenty-sdk/utils';

import { SLACK_USER_LINK_CONSENT_STATE } from 'src/logic-functions/constants/slack-user-link-consent-state';

export const isConsentedSlackUserLink = (
  consentState: string | undefined,
): boolean =>
  !isDefined(consentState) ||
  consentState === SLACK_USER_LINK_CONSENT_STATE.ACTIVE ||
  consentState === SLACK_USER_LINK_CONSENT_STATE.ADMIN_SET;
