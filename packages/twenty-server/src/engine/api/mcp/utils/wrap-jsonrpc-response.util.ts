import { type JsonRpcError } from 'src/engine/api/mcp/types/json-rpc-error.type';
import { type McpResult } from 'src/engine/api/mcp/types/mcp-result.type';

export const wrapJsonRpcResponse = (
  id: string | number,
  payload: { result: McpResult } | { error: JsonRpcError },
) => {
  return {
    id,
    jsonrpc: '2.0',
    ...payload,
  };
};
