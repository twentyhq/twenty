export const JSON_RPC_ERROR_CODE = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  // -32000 to -32099: reserved for implementation-defined server errors
  SERVER_ERROR: -32000,
} as const;
