export type CampaignStatus = 'draft' | 'scheduled' | 'active' | 'paused' | 'completed';

export type CampaignChannel = 'email' | 'social' | 'paid_search' | 'display' | 'content' | 'events';

export type CampaignData = {
  id: string;
  name: string;
  status: CampaignStatus;
  channel: CampaignChannel;
  budget: number;
  spent: number;
  leads: number;
  roi: number;
  currency: string;
  startDate: string;
  endDate: string;
};

export type LeadScoreRule = {
  id: string;
  attribute: string;
  condition: string;
  value: string;
  points: number;
  isActive: boolean;
};

export type TouchPoint = {
  channel: string;
  touchCount: number;
  weight: number;
  revenue: number;
  currency: string;
};

export type AttributionModel = 'first_touch' | 'last_touch' | 'linear' | 'time_decay';
