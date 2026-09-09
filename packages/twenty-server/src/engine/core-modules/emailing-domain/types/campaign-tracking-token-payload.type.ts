export type CampaignMessagePart = 'HTML' | 'TEXT';

export type CampaignTrackingTokenPayload = {
  purpose: 'CLICK';
  deliveryId: string;
  destinationId: string;
  messagePart: CampaignMessagePart;
};
