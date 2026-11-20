import { HttpStatus } from '@nestjs/common';

import { isNonEmptyString, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { JSON_RPC_ERROR_CODE } from 'src/engine/api/mcp/constants/json-rpc-error-code.const';
import { MCP_META_KEYS } from 'src/engine/api/mcp/constants/mcp-meta-keys.constant';
import { MCP_STATELESS_METHODS } from 'src/engine/api/mcp/constants/mcp-stateless-methods.constant';
import { MCP_STATELESS_PROTOCOL_VERSION } from 'src/engine/api/mcp/constants/mcp-stateless-protocol-version.constant';
import { type JsonRpcError } from 'src/engine/api/mcp/types/json-rpc-error.type';

type McpRequestHeaders = {
  protocolVersion?: string;
  method?: string;
  name?: string;
};

export type McpRequestProtocol =
  | { era: 'legacy' }
  | { era: 'stateless' }
  | { era: 'rejected'; httpStatus: HttpStatus; error: JsonRpcError };

const BASE64_HEADER_VALUE_PATTERN = /^=\?base64\?(.*)\?=$/;

const decodeHeaderValue = (value: string): string => {
  const base64Match = value.match(BASE64_HEADER_VALUE_PATTERN);

  return isDefined(base64Match)
    ? Buffer.from(base64Match[1], 'base64').toString('utf8')
    : value;
};

const reject = (
  httpStatus: HttpStatus,
  error: JsonRpcError,
): McpRequestProtocol => ({ era: 'rejected', httpStatus, error });

const rejectHeaderMismatch = (message: string) =>
  reject(HttpStatus.BAD_REQUEST, {
    code: JSON_RPC_ERROR_CODE.HEADER_MISMATCH,
    message,
  });

// A request is stateless when it carries the 2026-07-28 per-request metadata; initialize always selects the legacy flow
export const resolveMcpRequestProtocol = ({
  method,
  params,
  headers,
}: {
  method: string;
  params: Record<string, unknown> | undefined;
  headers: McpRequestHeaders;
}): McpRequestProtocol => {
  if (method === 'initialize') {
    return { era: 'legacy' };
  }

  const meta = isPlainObject(params?._meta) ? params._meta : undefined;
  const requestedVersion = meta?.[MCP_META_KEYS.protocolVersion];

  // Legacy clients may send any header value, which servers used to ignore
  if (
    !isDefined(requestedVersion) &&
    method !== 'server/discover' &&
    headers.protocolVersion !== MCP_STATELESS_PROTOCOL_VERSION
  ) {
    return { era: 'legacy' };
  }

  if (!isNonEmptyString(requestedVersion)) {
    return reject(HttpStatus.BAD_REQUEST, {
      code: JSON_RPC_ERROR_CODE.INVALID_PARAMS,
      message: `Missing required _meta field ${MCP_META_KEYS.protocolVersion}`,
    });
  }

  if (headers.protocolVersion !== requestedVersion) {
    return rejectHeaderMismatch(
      `Header mismatch: MCP-Protocol-Version header value '${headers.protocolVersion ?? ''}' does not match _meta value '${requestedVersion}'`,
    );
  }

  if (requestedVersion !== MCP_STATELESS_PROTOCOL_VERSION) {
    return reject(HttpStatus.BAD_REQUEST, {
      code: JSON_RPC_ERROR_CODE.UNSUPPORTED_PROTOCOL_VERSION,
      message: 'Unsupported protocol version',
      data: {
        supported: [MCP_STATELESS_PROTOCOL_VERSION],
        requested: requestedVersion,
      },
    });
  }

  if (!isPlainObject(meta?.[MCP_META_KEYS.clientCapabilities])) {
    return reject(HttpStatus.BAD_REQUEST, {
      code: JSON_RPC_ERROR_CODE.INVALID_PARAMS,
      message: `Missing required _meta field ${MCP_META_KEYS.clientCapabilities}`,
    });
  }

  if (headers.method !== method) {
    return rejectHeaderMismatch(
      `Header mismatch: Mcp-Method header value '${headers.method ?? ''}' does not match body value '${method}'`,
    );
  }

  if (method === 'tools/call') {
    const headerName = isString(headers.name)
      ? decodeHeaderValue(headers.name)
      : undefined;

    if (headerName !== params?.name) {
      return rejectHeaderMismatch(
        `Header mismatch: Mcp-Name header value '${headerName ?? ''}' does not match body value '${String(params?.name ?? '')}'`,
      );
    }
  }

  if (
    !MCP_STATELESS_METHODS.some((statelessMethod) => statelessMethod === method)
  ) {
    return reject(HttpStatus.NOT_FOUND, {
      code: JSON_RPC_ERROR_CODE.METHOD_NOT_FOUND,
      message: `Method '${method}' not found`,
    });
  }

  return { era: 'stateless' };
};
