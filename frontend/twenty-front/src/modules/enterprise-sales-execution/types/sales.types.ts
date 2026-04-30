export type DealStage = 'prospecting' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

export type DealData = {
  id: string;
  name: string;
  account: string;
  owner: string;
  stage: DealStage;
  amount: number;
  currency: string;
  closeDate: string;
  probability: number;
};

export type QuotaData = {
  repName: string;
  quota: number;
  actual: number;
  period: string;
};

export type TerritoryData = {
  id: string;
  name: string;
  region: string;
  owner: string;
  accountCount: number;
  revenue: number;
};
