import { CAMPAIGN_TRACKING_TOKEN_SEPARATOR } from 'src/engine/core-modules/emailing-domain/constants/campaign-tracking-token-separator.constant';
import { type CampaignOpenTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-open-tracking-token-payload.type';

export const encodeCampaignOpenTrackingToken = ({
  workspaceId,
  deliveryId,
}: CampaignOpenTrackingTokenPayload): string =>
  Buffer.from(
    [workspaceId, deliveryId].join(CAMPAIGN_TRACKING_TOKEN_SEPARATOR),
  ).toString('base64url');
