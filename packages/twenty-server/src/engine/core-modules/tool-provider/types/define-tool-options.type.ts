import { type ToolCategory } from 'twenty-shared/ai';

import { type ToolApplicationTarget } from 'src/engine/core-modules/tool-provider/types/tool-application-target.type';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

export type DefineToolOptions = {
  name: string;
  category: ToolCategory;
  description: string;
  accessPolicy: AccessPolicy;
  applicationTarget?: ToolApplicationTarget;
  icon?: string;
};
