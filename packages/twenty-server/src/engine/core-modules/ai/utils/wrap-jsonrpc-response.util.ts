import { MCP_SERVER_METADATA } from 'src/engine/core-modules/ai/constants/mcp.const';

export const wrapJsonRpcResponse = (
  id: string | number | null | undefined = null,
  payload:
    | Record<'result', Record<string, unknown>>
    | Record<'error', Record<string, unknown>>,
  omitMetadata = false,
) => {
  const body =
    'result' in payload
      ? {
          result: omitMetadata
            ? payload.result
            : { ...payload.result, ...MCP_SERVER_METADATA },
        }
      : {
          error: omitMetadata
            ? payload.error
            : { ...payload.error, ...MCP_SERVER_METADATA },
        };

  return {
    id,
    jsonrpc: '2.0',
    ...body,
  };
};
