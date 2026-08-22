import { isDefined } from 'twenty-shared/utils';

import { type McpProgressToken } from 'src/engine/api/mcp/types/mcp-progress-token.type';

// ProgressToken is typed ["string", "integer"], so echoing a fractional number
// back would emit a notification a schema-validating client rejects
const isProgressToken = (value: unknown): value is McpProgressToken =>
  typeof value === 'string' || Number.isInteger(value);

// Progress notifications may only reference a token the client supplied in
// params._meta, so a request without one gets no progress at all
export const getProgressToken = (
  params: Record<string, unknown>,
): McpProgressToken | undefined => {
  const meta = params._meta;

  if (!isDefined(meta) || typeof meta !== 'object') {
    return undefined;
  }

  const progressToken = (meta as { progressToken?: unknown }).progressToken;

  return isProgressToken(progressToken) ? progressToken : undefined;
};
