import { type ToolCategory } from 'twenty-shared/ai';
import { type PermissionFlagType } from 'twenty-shared/constants';
import { type FeatureFlagKey } from 'twenty-shared/types';

export type DefineToolOptions = {
  name: string;
  category: ToolCategory;
  description: string;
  requiredPermissionFlags: PermissionFlagType[];
  requiredFeatureFlags?: FeatureFlagKey[];
  // set only when the tool authorizes everything with the caller's config; others are withheld from a scoped caller
  canRunUnderScope?: boolean;
  icon?: string;
};
