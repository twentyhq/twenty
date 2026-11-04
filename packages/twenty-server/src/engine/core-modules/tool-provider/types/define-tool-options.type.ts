import { type ToolCategory } from 'twenty-shared/ai';

import { type ApplicationOperation } from 'src/engine/core-modules/application/types/application-operation.type';
import { type AccessPolicy } from 'src/engine/guards/types/access-policy.type';

export type DefineToolOptions = {
  name: string;
  category: ToolCategory;
  description: string;
  accessPolicy: AccessPolicy;
  // The calling application must reach every application for this operation, so a
  // scoped application and its agents, which the access policy admits, never get the tool
  requiredApplicationReach?: Exclude<ApplicationOperation, 'manage'>;
  icon?: string;
};
