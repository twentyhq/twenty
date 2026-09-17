import { UsageLimitException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { WorkspaceCacheException } from 'src/engine/workspace-cache/exceptions/workspace-cache.exception';

export const isAdmittableQuotaFailure = (error: unknown): boolean =>
  !(error instanceof WorkspaceCacheException) &&
  !(error instanceof UsageLimitException);
