export type PartnerTier = 'registered' | 'silver' | 'gold' | 'platinum';

export type PartnerData = {
  id: string;
  companyName: string;
  contactName: string;
  tier: PartnerTier;
  dealCount: number;
  revenue: number;
  currency: string;
  region: string;
  joinedAt: string;
};

export type DealRegistration = {
  id: string;
  partnerId: string;
  partnerName: string;
  dealName: string;
  value: number;
  currency: string;
  status: 'submitted' | 'approved' | 'rejected' | 'won' | 'lost';
  submittedAt: string;
  expiresAt: string;
};

export type PartnerRanking = {
  rank: number;
  partnerId: string;
  partnerName: string;
  tier: PartnerTier;
  totalRevenue: number;
  dealsWon: number;
  currency: string;
};
