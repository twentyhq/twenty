export type HealthScore = 'healthy' | 'at_risk' | 'churning';

export type AccountHealthData = {
  id: string;
  accountName: string;
  csm: string;
  healthScore: HealthScore;
  nps: number;
  lastContactDate: string;
  arr: number;
  renewalDate: string;
};

export type PlaybookData = {
  id: string;
  name: string;
  accountName: string;
  currentStep: number;
  totalSteps: number;
  status: 'active' | 'paused' | 'completed';
  startedAt: string;
};

export type QBRData = {
  id: string;
  accountName: string;
  csm: string;
  scheduledDate: string;
  quarter: string;
  status: 'scheduled' | 'completed' | 'cancelled';
};
