import { type FeatureFlag } from '@/settings/admin-panel/types/FeatureFlag';
import { type WorkspaceUrls } from '~/generated-metadata/graphql';

export type WorkspaceInfo = {
  id: string;
  name: string;
  logo?: string | null;
  totalUsers: number;
  workspaceUrls: WorkspaceUrls;
  users: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  }[];
  featureFlags: FeatureFlag[];
  allowImpersonation: boolean;
};
