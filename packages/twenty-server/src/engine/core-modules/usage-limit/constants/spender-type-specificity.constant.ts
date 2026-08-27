import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';

export const SPENDER_TYPE_SPECIFICITY: Record<SpenderType, number> = {
  apiKey: 0,
  userWorkspace: 1,
  agent: 2,
  workflow: 3,
  logicFunction: 4,
  application: 5,
  workspace: 6,
};
