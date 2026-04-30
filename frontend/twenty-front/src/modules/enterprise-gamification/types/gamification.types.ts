export type LeaderboardEntry = {
  rank: number;
  repName: string;
  points: number;
  deals: number;
  streak: number;
  avatar: string;
};

export type BadgeData = {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
};

export type ChallengeData = {
  id: string;
  title: string;
  description: string;
  targetValue: number;
  currentValue: number;
  reward: string;
  deadline: string;
  status: 'active' | 'completed' | 'expired';
};
