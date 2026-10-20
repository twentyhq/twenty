import { type ToolCategory } from 'twenty-shared/ai';
import { type PermissionFlagType } from 'twenty-shared/constants';

export type DefineToolOptions = {
  name: string;
  category: ToolCategory;
  description: string;
  requiredPermissionFlags: PermissionFlagType[];
};
