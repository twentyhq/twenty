export const wrapJsonRpcResponse = (
  id: string | number,
  payload:
    | Record<'result', Record<string, unknown>>
    | Record<'error', Record<string, unknown>>,
) => {
  return {
    id,
    jsonrpc: '2.0',
    ...payload,
  };
};
