import { type ToolCategory } from 'twenty-shared/ai';
import { type PermissionFlagType } from 'twenty-shared/constants';
import { type FeatureFlagKey } from 'twenty-shared/types';

export type DefineToolOptions = {
  name: string;
  category: ToolCategory;
  description: string;
  requiredPermissionFlags: PermissionFlagType[];
  requiredFeatureFlags?: FeatureFlagKey[];
  // the tool authorizes its work itself (as the member or the system), so a caller narrowed by a scope never gets it
  ignoresRolePermissionConfig?: boolean;
  icon?: string;
};
