import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { resolveToolName } from 'src/engine/core-modules/tool-provider/utils/resolve-tool-name.util';

const MAX_MCP_LOG_FIELD_LENGTH = 128;
const MCP_LOG_FIELD_PATTERN = /^[A-Za-z0-9_.:/-]+$/;

const toLoggableValue = (value: unknown) =>
  isNonEmptyString(value) &&
  value.length <= MAX_MCP_LOG_FIELD_LENGTH &&
  MCP_LOG_FIELD_PATTERN.test(value)
    ? value
    : undefined;

export const getMcpRequestLogFields = (
  body: unknown,
): {
  method?: string;
  toolName?: string;
} => {
  if (!isPlainObject(body)) {
    return {};
  }

  const params = isPlainObject(body.params) ? body.params : undefined;

  return {
    method: toLoggableValue(body.method),
    toolName:
      body.method === 'tools/call' && isNonEmptyString(params?.name)
        ? toLoggableValue(
            resolveToolName({ toolName: params.name, input: params.arguments }),
          )
        : undefined,
  };
};
