import { type ToolCategory } from 'twenty-shared/ai';

import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

export type DefineToolOptions = {
  name: string;
  category: ToolCategory;
  description: string;
  accessPolicy: AccessPolicy;
  icon?: string;
};
