import { type CampaignMessagePart } from 'src/engine/core-modules/emailing-domain/types/campaign-message-part.type';

export type CampaignTrackingTokenPayload = {
  purpose: 'CLICK';
  deliveryId: string;
  destinationId: string;
  messagePart: CampaignMessagePart;
};
