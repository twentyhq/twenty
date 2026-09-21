import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';

export const buildRateLimitResponseHeaders = ({
  exhaustedScope,
  retryAfterSeconds,
}: {
  exhaustedScope: ExhaustedScope;
  retryAfterSeconds: number;
}): Record<string, string> => ({
  'Retry-After': String(retryAfterSeconds),
  'X-RateLimit-Limit': String(exhaustedScope.limitValue),
  'X-RateLimit-Remaining': String(exhaustedScope.remaining),
  'X-RateLimit-Reset': String(Math.ceil(Date.now() / 1000) + retryAfterSeconds),
});
