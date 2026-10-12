import { isValidUuid } from 'twenty-shared/utils';

import { CAMPAIGN_TRACKING_TOKEN_SEPARATOR } from 'src/engine/core-modules/emailing-domain/constants/campaign-tracking-token-separator.constant';
import { type CampaignOpenTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-open-tracking-token-payload.type';

export const decodeCampaignOpenTrackingToken = (
  token: string,
): CampaignOpenTrackingTokenPayload | null => {
  const decodedToken = Buffer.from(token, 'base64url');

  if (decodedToken.toString('base64url') !== token) {
    return null;
  }

  const [workspaceId, deliveryId, ...rest] = decodedToken
    .toString('utf8')
    .split(CAMPAIGN_TRACKING_TOKEN_SEPARATOR);

  if (
    rest.length > 0 ||
    ![workspaceId, deliveryId].every((identifier) =>
      isValidUuid(identifier ?? ''),
    )
  ) {
    return null;
  }

  return { workspaceId, deliveryId };
};
