import { isNonEmptyString } from '@sniptt/guards';

import { type JsonRpc } from 'src/engine/api/mcp/dtos/json-rpc';
import { resolveToolName } from 'src/engine/core-modules/tool-provider/utils/resolve-tool-name.util';

export const getMcpRequestToolName = ({
  method,
  params,
}: Pick<JsonRpc, 'method' | 'params'>): string | undefined => {
  if (method !== 'tools/call' || !isNonEmptyString(params?.name)) {
    return undefined;
  }

  return resolveToolName({ toolName: params.name, input: params.arguments });
};
