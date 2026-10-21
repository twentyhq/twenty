import { CAMPAIGN_TRACKING_TOKEN_SEPARATOR } from 'src/engine/core-modules/emailing-domain/constants/campaign-tracking-token-separator.constant';
import { type CampaignTrackingTokenPayload } from 'src/engine/core-modules/emailing-domain/types/campaign-tracking-token-payload.type';

export const encodeCampaignTrackingToken = ({
  workspaceId,
  deliveryId,
  shortLinkId,
}: CampaignTrackingTokenPayload): string =>
  Buffer.from(
    [workspaceId, deliveryId, shortLinkId].join(
      CAMPAIGN_TRACKING_TOKEN_SEPARATOR,
    ),
  ).toString('base64url');
