import { isNonEmptyString } from '@sniptt/guards';

import { type JsonRpc } from 'src/engine/api/mcp/dtos/json-rpc';
import { resolveToolName } from 'src/engine/core-modules/tool-provider/utils/resolve-tool-name.util';

const MAX_MCP_LOG_FIELD_LENGTH = 128;
const MCP_LOG_FIELD_PATTERN = /^[A-Za-z0-9_.:/-]+$/;

const toLoggableValue = (value: string | undefined) =>
  isNonEmptyString(value) &&
  value.length <= MAX_MCP_LOG_FIELD_LENGTH &&
  MCP_LOG_FIELD_PATTERN.test(value)
    ? value
    : undefined;

export const getMcpRequestLogFields = ({
  method,
  params,
}: Pick<JsonRpc, 'method' | 'params'>): {
  method?: string;
  toolName?: string;
} => ({
  method: toLoggableValue(method),
  toolName:
    method === 'tools/call' && isNonEmptyString(params?.name)
      ? toLoggableValue(
          resolveToolName({ toolName: params.name, input: params.arguments }),
        )
      : undefined,
});
