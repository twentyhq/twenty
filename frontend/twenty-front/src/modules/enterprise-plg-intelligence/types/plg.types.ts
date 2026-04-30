export type FeatureUsageData = {
  featureName: string;
  category: string;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  adoptionRate: number;
  intensity: 'low' | 'medium' | 'high';
};

export type PQLData = {
  id: string;
  accountName: string;
  contactName: string;
  pqlScore: number;
  signupDate: string;
  topFeature: string;
  usageFrequency: 'daily' | 'weekly' | 'monthly';
  plan: string;
};

export type TrialConversionData = {
  stage: string;
  count: number;
  conversionRate: number;
  avgDaysInStage: number;
};
