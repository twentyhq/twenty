import { type FlatUsageLimit } from 'src/engine/core-modules/usage-limit/types/flat-usage-limit.type';
import { isIntraWorkspaceScoped } from 'src/engine/core-modules/usage-limit/utils/is-intra-workspace-scoped.util';

export const findEnforceableLimits = ({
  limits,
  isIntraWorkspaceLimitEntitled,
}: {
  limits: FlatUsageLimit[];
  isIntraWorkspaceLimitEntitled: boolean;
}): FlatUsageLimit[] =>
  isIntraWorkspaceLimitEntitled
    ? limits
    : limits.filter((limit) => !isIntraWorkspaceScoped(limit.spenderType));
