import { type SpenderType } from 'src/engine/core-modules/usage-limit/types/spender-type.type';

export const isIntraWorkspaceScoped = (spenderType: SpenderType): boolean =>
  spenderType !== 'workspace';
