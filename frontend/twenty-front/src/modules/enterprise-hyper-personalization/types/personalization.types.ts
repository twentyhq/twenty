export type PersonalizationRuleData = {
  id: string;
  name: string;
  segment: string;
  channel: string;
  condition: string;
  action: string;
  isActive: boolean;
  lastTriggered: string;
};

export type EngagementScoreData = {
  id: string;
  contactName: string;
  email: string;
  score: number;
  trend: 'rising' | 'stable' | 'declining';
  lastActivity: string;
  topChannel: string;
};

export type ContentRecommendationData = {
  id: string;
  title: string;
  contentType: 'article' | 'video' | 'case_study' | 'whitepaper';
  relevanceScore: number;
  targetSegment: string;
  views: number;
  conversions: number;
};
