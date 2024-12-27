import { FeatureFlag } from '@/settings/admin-panel/types/FeatureFlag';

export type WorkspaceInfo = {
  id: string;
  name: string;
  logo?: string | null;
  totalUsers: number;
  users: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  }[];
  featureFlags: FeatureFlag[];
  allowImpersonation: boolean;
};
