export type AccountTier = 'tier_1' | 'tier_2' | 'tier_3';

export type TargetAccountData = {
  id: string;
  accountName: string;
  tier: AccountTier;
  industry: string;
  owner: string;
  engagementScore: number;
  pipeline: number;
};

export type StakeholderData = {
  id: string;
  name: string;
  title: string;
  accountName: string;
  role: 'decision_maker' | 'influencer' | 'champion' | 'blocker';
  sentiment: 'positive' | 'neutral' | 'negative';
  lastContact: string;
};

export type ABMCampaignData = {
  id: string;
  name: string;
  tier: AccountTier;
  status: 'active' | 'paused' | 'completed';
  accountsTargeted: number;
  engaged: number;
  pipeline: number;
  startDate: string;
};
