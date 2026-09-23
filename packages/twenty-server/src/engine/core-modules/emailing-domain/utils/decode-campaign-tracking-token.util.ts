import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { CAMPAIGN_TRACKING_TOKEN_SEPARATOR } from 'src/engine/core-modules/emailing-domain/constants/campaign-tracking-token-separator.constant';
import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';

export const decodeCampaignTrackingToken = (
  token: string,
): CampaignTrackingTokenPayload | null => {
  const decodedToken = Buffer.from(token, 'base64url');

  if (decodedToken.toString('base64url') !== token) {
    return null;
  }

  const [workspaceId, deliveryId, shortLinkId, ...rest] = decodedToken
    .toString('utf8')
    .split(CAMPAIGN_TRACKING_TOKEN_SEPARATOR);

  if (
    rest.length > 0 ||
    !isDefined(workspaceId) ||
    !isDefined(deliveryId) ||
    !isDefined(shortLinkId) ||
    ![workspaceId, deliveryId, shortLinkId].every(isValidUuid)
  ) {
    return null;
  }

  return { workspaceId, deliveryId, shortLinkId };
};
