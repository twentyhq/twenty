export type CoachingSessionData = {
  id: string;
  repName: string;
  coachName: string;
  topic: string;
  scheduledAt: string;
  duration: number;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes: string;
};

export type CallReviewData = {
  id: string;
  repName: string;
  callDate: string;
  prospect: string;
  duration: number;
  overallScore: number;
  talkRatio: number;
  questionCount: number;
  sentiment: 'positive' | 'neutral' | 'negative';
};

export type SkillGapData = {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  gap: number;
  priority: 'low' | 'medium' | 'high';
};
