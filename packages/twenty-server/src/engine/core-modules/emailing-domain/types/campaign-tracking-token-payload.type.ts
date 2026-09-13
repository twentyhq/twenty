type CampaignClickTokenPayload = {
  purpose: 'CLICK';
  deliveryId: string;
  shortLinkId: string;
};

type CampaignOpenTokenPayload = {
  purpose: 'OPEN';
  deliveryId: string;
};

export type CampaignTrackingTokenPayload =
  | CampaignClickTokenPayload
  | CampaignOpenTokenPayload;
