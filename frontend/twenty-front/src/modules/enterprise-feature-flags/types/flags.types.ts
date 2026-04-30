export type FlagScope = 'workspace' | 'user' | 'global';

export type FeatureFlag = {
  id: string;
  key: string;
  label: string;
  description: string;
  enabled: boolean;
  scope: FlagScope;
  updatedAt: string;
  createdAt: string;
};

export type FlagAdoptionMetric = {
  flagId: string;
  flagKey: string;
  flagLabel: string;
  activeUsers: number;
  totalUsers: number;
  adoptionPercentage: number;
  lastUsedAt: string;
};

export type BulkToggleResult = {
  flagId: string;
  success: boolean;
  error: string | null;
};
